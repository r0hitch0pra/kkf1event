<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Door QR — Komic Karma</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background: #000;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card {
            text-align: center;
            padding: 48px 56px;
            max-width: 560px;
            width: 100%;
        }

        .ferrari {
            width: 100%;
            height: 200px;
            object-fit: cover;
            object-position: center 60%;
            border-radius: 16px;
            margin-bottom: 20px;
        }

        .f1-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #dc2626;
            color: #fff;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            padding: 6px 16px;
            border-radius: 999px;
            margin-bottom: 28px;
        }

        .logo {
            width: 220px;
            margin: 0 auto 32px;
            filter: brightness(0) invert(1);
            display: block;
        }

        .tagline {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: #fbbf24;
            margin-bottom: 32px;
        }

        .qr-wrap {
            background: #fff;
            border-radius: 24px;
            padding: 20px;
            display: inline-block;
            margin-bottom: 28px;
        }

        .qr-wrap svg {
            display: block;
            width: 280px;
            height: 280px;
        }

        .cta {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.02em;
            margin-bottom: 8px;
        }

        .sub {
            font-size: 13px;
            color: #71717a;
        }

        .url {
            margin-top: 20px;
            font-size: 11px;
            color: #3f3f46;
            letter-spacing: 0.05em;
        }

        @media print {
            body { background: #fff; color: #000; }
            .logo { filter: none; }
            .tagline { color: #b45309; }
            .sub { color: #52525b; }
            .url { color: #a1a1aa; }
        }
    </style>
</head>
<body>
    <div class="card">
        <img
            src="/f1-party.jpg"
            alt="F1 Watch Party"
            class="ferrari"
        >
        <div class="f1-badge">🏁 F1 Watch Party Tonight</div>
        <img src="/logo.svg" alt="Komic Karma" class="logo">
        <p class="tagline">Cars, Cues &amp; Comedy</p>

        <div class="qr-wrap">
            {!! $qrSvg !!}
        </div>

        <p class="cta">Scan to check in</p>
        <p class="sub">Get your wristband · Access tonight's activities</p>
        <p class="url">{{ $url }}</p>
    </div>
</body>
</html>
