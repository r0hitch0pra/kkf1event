<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class SignupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $phone = $this->input('phone', '');
        $returning = User::where('phone', $phone)->where('is_staff', false)->exists();

        return [
            'phone' => ['required', 'string', 'regex:/^\+?[1-9]\d{7,14}$/'],
            'name' => $returning ? ['nullable', 'string', 'max:100'] : ['required', 'string', 'max:100'],
            'party_size' => $returning ? ['nullable', 'integer', 'min:1', 'max:20'] : ['required', 'integer', 'min:1', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a valid phone number.',
        ];
    }
}
