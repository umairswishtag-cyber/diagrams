<?php

namespace App\Services;

use App\Models\User;
use DOMDocument;
use DOMElement;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DiagramAssetService
{
    public function storeFor(User $user, UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = Str::uuid().'.'.$extension;
        $relativeDirectory = 'uploads/diagram-assets/'.$user->id;
        $directory = public_path($relativeDirectory);

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        if ($extension === 'svg') {
            $svg = file_get_contents($file->getRealPath());
            file_put_contents($directory.DIRECTORY_SEPARATOR.$filename, $this->sanitizeSvg($svg));
        } else {
            $file->move($directory, $filename);
        }

        return [
            'url' => asset($relativeDirectory.'/'.$filename),
            'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'type' => $extension,
        ];
    }

    public function sanitizeSvg(string $svg): string
    {
        if (preg_match('/<!ENTITY/i', $svg)) {
            throw ValidationException::withMessages(['asset' => 'SVG entities are not supported.']);
        }

        $svg = $this->stripSvgDoctype($svg);

        $previous = libxml_use_internal_errors(true);
        $document = new DOMDocument;
        $loaded = $document->loadXML($svg, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (! $loaded || ! $document->documentElement || strtolower($document->documentElement->localName) !== 'svg') {
            throw ValidationException::withMessages(['asset' => 'The uploaded file is not a valid SVG image.']);
        }

        $this->sanitizeSvgElement($document->documentElement);

        return $document->saveXML($document->documentElement);
    }

    private function stripSvgDoctype(string $svg): string
    {
        return preg_replace('/<!DOCTYPE\b(?:[^>"\'\[]+|"[^"]*"|\'[^\']*\')*(?:\[(?:[^\]]|\](?!\s*>))*\]\s*)?>/is', '', $svg) ?? $svg;
    }

    private function sanitizeSvgElement(DOMElement $element): void
    {
        $forbiddenElements = ['script', 'foreignobject', 'iframe', 'object', 'embed'];

        foreach (iterator_to_array($element->childNodes) as $child) {
            if ($child instanceof DOMElement) {
                if (in_array(strtolower($child->localName), $forbiddenElements, true)) {
                    $element->removeChild($child);

                    continue;
                }

                $this->sanitizeSvgElement($child);
            }
        }

        foreach (iterator_to_array($element->attributes) as $attribute) {
            $name = strtolower($attribute->localName);
            $value = trim($attribute->value);

            if (str_starts_with($name, 'on') || $name === 'base') {
                $element->removeAttributeNode($attribute);

                continue;
            }

            if (in_array($name, ['href', 'src'], true) && ! $this->isSafeSvgReference($value)) {
                $element->removeAttributeNode($attribute);

                continue;
            }

            if (($name === 'style' || str_contains(strtolower($value), 'url(')) && $this->containsUnsafeSvgCss($value)) {
                $element->removeAttributeNode($attribute);
            }
        }

        if (strtolower($element->localName) === 'style' && $this->containsUnsafeSvgCss($element->textContent)) {
            $element->textContent = '';
        }
    }

    private function isSafeSvgReference(string $value): bool
    {
        if ($value === '' || str_starts_with($value, '#')) {
            return true;
        }

        return (bool) preg_match('/^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+\/=\s]+$/i', $value);
    }

    private function containsUnsafeSvgCss(string $css): bool
    {
        if (preg_match('/javascript\s*:|expression\s*\(|@import|behavior\s*:|-moz-binding/i', $css)) {
            return true;
        }

        preg_match_all('/url\s*\(\s*(["\']?)(.*?)\1\s*\)/is', $css, $matches);
        foreach ($matches[2] as $reference) {
            if (! $this->isSafeSvgReference(trim($reference))) {
                return true;
            }
        }

        return false;
    }
}
