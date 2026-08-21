// Copyright (c) 2026 Justin Andrew Wood. All rights reserved.
// This software is licensed under the AGPL-3.0.
// Commercial licensing is available at echosh-labs.com.
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './tui.html', './mcp/index.html'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
            colors: {
                charcoal: {
                    900: '#0a0c10',
                    800: '#0f1117',
                    700: '#161a23',
                },
                accent: {
                    cyan: '#1dd3b0',
                    amber: '#f5a524',
                },
            },
            boxShadow: {
                glow: '0 0 40px rgba(29, 211, 176, 0.15)',
            },
            transitionTimingFunction: {
                soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
        },
    },
    plugins: [],
};
