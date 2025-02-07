const { parse, stringifySync } = require('subtitle');
const JSZip = require('jszip');
const { Readable } = require('stream');

exports.handler = async (event, context) => {
    try {
        const { files, seconds } = JSON.parse(event.body);
        const zip = new JSZip();

        for (const file of files) {
            const content = Buffer.from(file.content, 'base64').toString('utf-8');
            console.log(`Processing file: ${file.name}`);
            console.log(`Original content: ${content.substring(0, 100)}...`); // Log first 100 chars

            const parsed = await parseToArray(content);
            console.log(`Parsed content: ${JSON.stringify(parsed)}`); // Log entire parsed content

            const modified = parsed.map(cue => {
                if (cue.type === 'cue') {
                    // Only add seconds to the end time
                    cue.data.end += seconds * 1000;
                }
                return cue;
            });

            // Correctly format the modified subtitles
            let modifiedContent = '';
            let cueNumber = 1;
            for (const cue of modified) {
                if (cue.type === 'cue') {
                    const start = formatTime(cue.data.start);
                    const end = formatTime(cue.data.end);
                    modifiedContent += `${cueNumber}\n${start} --> ${end}\n${cue.data.text}\n\n`;
                    cueNumber++;
                }
            }

            console.log(`Modified content: ${modifiedContent.substring(0, 100)}...`); // Log first 100 chars

            zip.file(file.name, modifiedContent);
        }

        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="modified_srt_files.zip"'
            },
            body: zipContent.toString('base64'),
            isBase64Encoded: true
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function parseToArray(content) {
    return new Promise((resolve, reject) => {
        const items = [];
        const readable = Readable.from(content);
        readable.pipe(parse())
            .on('data', item => items.push(item))
            .on('end', () => resolve(items))
            .on('error', reject);
    });
}

function formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(ms, 3)}`;
}

function pad(num, size = 2) {
    let s = String(num);
    while (s.length < size) s = `0${s}`;
    return s;
}