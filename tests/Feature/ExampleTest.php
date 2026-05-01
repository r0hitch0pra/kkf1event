<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_checkin_page_loads(): void
    {
        $response = $this->withoutVite()->get('/checkin');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Checkin'));
    }
}
