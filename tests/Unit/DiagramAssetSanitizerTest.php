<?php

namespace Tests\Unit;

use App\Http\Controllers\DiagramAssetController;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\Test;
use ReflectionMethod;
use Tests\TestCase;

class DiagramAssetSanitizerTest extends TestCase
{
    #[Test]
    public function it_keeps_normal_svg_content_and_embedded_raster_images(): void
    {
        $svg = <<<'SVG'
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
            <defs><linearGradient id="paint"><stop offset="0" stop-color="#fff"/></linearGradient></defs>
            <style>.shape { fill: url("#paint"); }</style>
            <rect class="shape" width="200" height="100" onclick="alert(1)"/>
            <image href="data:image/png;base64,iVBORw0KGgo=" width="20" height="20"/>
        </svg>
        SVG;

        $result = $this->sanitize($svg);

        $this->assertStringContainsString('linearGradient', $result);
        $this->assertStringContainsString('data:image/png;base64,iVBORw0KGgo=', $result);
        $this->assertStringNotContainsString('onclick', $result);
    }

    #[Test]
    public function it_removes_executable_elements_and_external_resources(): void
    {
        $svg = <<<'SVG'
        <svg xmlns="http://www.w3.org/2000/svg">
            <script>alert(1)</script>
            <foreignObject><div>unsafe</div></foreignObject>
            <image href="https://example.com/tracker.png"/>
            <rect fill="url(https://example.com/paint.svg#gradient)"/>
            <a href="javascript:alert(1)"><text>Label</text></a>
        </svg>
        SVG;

        $result = $this->sanitize($svg);

        $this->assertStringNotContainsString('<script', $result);
        $this->assertStringNotContainsString('foreignObject', $result);
        $this->assertStringNotContainsString('https://', $result);
        $this->assertStringNotContainsString('javascript:', $result);
        $this->assertStringContainsString('Label', $result);
    }

    #[Test]
    public function it_rejects_document_type_declarations(): void
    {
        $this->expectException(ValidationException::class);

        $this->sanitize('<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"/>');
    }

    private function sanitize(string $svg): string
    {
        $method = new ReflectionMethod(DiagramAssetController::class, 'sanitizeSvg');

        return $method->invoke(new DiagramAssetController, $svg);
    }
}
