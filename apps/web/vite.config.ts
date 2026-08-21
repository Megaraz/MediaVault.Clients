import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { env } from 'node:process';
import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import plugin from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type ServerOptions } from 'vite';

const webRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ command, mode }) => {
    const publicEnvironment = loadEnv(mode, webRoot, 'VITE_');
    validateProductionApiBaseUrl(command, publicEnvironment.VITE_MEDIA_VAULT_API_URL);

    return {
        appType: 'spa',
        plugins: [plugin(), tailwindcss()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                // The shared ResultPattern package is intentionally CommonJS for
                // Node consumers. Vite's dev server serves workspace packages
                // directly to the browser, so resolve it to its typed source
                // entry instead of exposing the CommonJS dist entry as ESM.
                'result-pattern-typescript': fileURLToPath(new URL('../../packages/result-pattern-typescript/src/index.ts', import.meta.url)),
            },
        },
        ...(command === 'serve' ? { server: createDevelopmentServerOptions() } : {}),
        build: {
            commonjsOptions: {
                include: [/node_modules/, /packages[\\/]result-pattern-typescript[\\/]/],
            },
        },
    };
});

function validateProductionApiBaseUrl(command: 'build' | 'serve', value: string | undefined): void {
    if (command !== 'build') return;

    const configurationName = 'VITE_MEDIA_VAULT_API_URL';
    if (value === undefined || value.trim().length === 0) {
        throw new Error(`${configurationName} is required for a production web build.`);
    }

    let apiBaseUrl: URL;
    try {
        apiBaseUrl = new URL(value);
    } catch {
        throw new Error(`${configurationName} must be an absolute HTTPS URL.`);
    }

    if (
        apiBaseUrl.protocol !== 'https:'
        || apiBaseUrl.username.length > 0
        || apiBaseUrl.password.length > 0
        || apiBaseUrl.search.length > 0
        || apiBaseUrl.hash.length > 0
    ) {
        throw new Error(`${configurationName} must be an absolute HTTPS URL without credentials, a query, or a fragment.`);
    }

    const hostname = apiBaseUrl.hostname.toLowerCase();
    if (
        hostname === 'localhost'
        || hostname.endsWith('.localhost')
        || hostname === '127.0.0.1'
        || hostname === '::1'
    ) {
        throw new Error(`${configurationName} must not target localhost in a production web build.`);
    }
}

function createDevelopmentServerOptions(): ServerOptions {
    const baseFolder = env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;
    const certificateName = 'media-vault-app.client';
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        const result = childProcess.spawnSync('dotnet', [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
        ], { stdio: 'inherit' });

        if (result.status !== 0) {
            throw new Error('Could not create the web development certificate.');
        }
    }

    const target = env.ASPNETCORE_HTTPS_PORT
        ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
        : env.ASPNETCORE_URLS
            ? env.ASPNETCORE_URLS.split(';')[0]
            : 'http://localhost:5210';

    return {
        proxy: {
            '^/[Uu]sers': { target, secure: false },
            '^/[Mm]edia[Ee]ntries': { target, secure: false },
            '^/[Aa]uth': { target, secure: false },
            '^/[Rr]awg[Aa]pi': { target, secure: false },
            '^/[Tt]mdb[Aa]pi': { target, secure: false },
            '^/[Gg]oogle[Bb]ooks[Aa]pi': { target, secure: false },
            '^/openapi': { target, secure: false },
        },
        port: Number.parseInt(env.DEV_SERVER_PORT || '61366', 10),
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        },
    };
}
