<?php

use Osiset\ShopifyApp\Util;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DiagramAssetController;
use App\Http\Controllers\DiagramController;

if (!config('shopify-app.appbridge_enabled')) {
    Route::match(
        ['GET', 'POST'],
        '/authenticate',
        AuthenticatedSessionController::class . '@authenticate'
    )
        ->name('authenticate');
    Route::get(
        '/authenticate/token',
        AuthenticatedSessionController::class . '@authenticate'
    )
        ->middleware(['verify.shopify'])
        ->name(Util::getShopifyConfig('route_names.authenticate.token'));
}

Route::get('/', [DiagramController::class, 'index'])->name('home');
Route::get('/dashboard', [DiagramController::class, 'index'])->name('dashboard');
Route::get('/diagrams/create', [DiagramController::class, 'create'])->name('diagrams.create');
Route::post('/diagrams', [DiagramController::class, 'store'])->name('diagrams.store');
Route::get('/diagrams/{diagram}/edit', [DiagramController::class, 'edit'])->name('diagrams.edit');
Route::put('/diagrams/{diagram}', [DiagramController::class, 'update'])->name('diagrams.update');
Route::delete('/diagrams/{diagram}', [DiagramController::class, 'destroy'])->name('diagrams.destroy');
Route::post('/diagram-assets', [DiagramAssetController::class, 'store'])->name('diagram-assets.store');

Route::middleware(['auth'])->group(function () {

    Route::get('/search', [DashboardController::class, 'orderSeacrhfilter'])->name('search');

});

require __DIR__ . '/auth.php';
