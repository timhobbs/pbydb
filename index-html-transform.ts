import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';

import { TargetOptions } from '@angular-builders/custom-webpack';

export default (targetOptions: TargetOptions, indexHtml: string) => {
    const $ = cheerio.load(indexHtml);
    dotenv.config();

    const reduced = Object.entries(process.env)
        .filter(([key, value]) => key.startsWith('PBYDB'))
        .reduce((acc, [key, value]) => {
            acc[key] = value;

            return acc;
        }, {} as any);

    $('body').append(
        `<script>window.sessionStorage.setItem('appSettings', '${JSON.stringify(reduced)}');</script>`
    );

    return $.html();
};
