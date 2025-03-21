import fetch from 'node-fetch';  // Usamos fetch para las solicitudes HTTP
import { FormData, Blob } from 'formdata-node';  // Usamos FormData para enviar archivos
import { JSDOM } from 'jsdom';  // Usamos JSDOM para parsear el HTML de la respuesta

// Función para convertir un archivo WebP a MP4
async function webp2mp4(source) {
    let form = new FormData();
    let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
    const blob = !isUrl && new Blob([source.toArrayBuffer()]);
    form.append('new-image-url', isUrl ? source : '');
    form.append('new-image', isUrl ? '' : blob, 'image.webp');
    
    let res = await fetch('https://ezgif.com/webp-to-mp4', {
        method: 'POST',
        body: form,
    });

    let html = await res.text();
    let { document } = new JSDOM(html).window;
    let form2 = new FormData();
    let obj = {};

    // Extraemos los valores necesarios para hacer un segundo POST
    for (let input of document.querySelectorAll('form input[name]')) {
        obj[input.name] = input.value;
        form2.append(input.name, input.value);
    }

    // Realizamos el segundo POST para obtener el archivo final
    let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, {
        method: 'POST',
        body: form2,
    });

    let html2 = await res2.text();
    let { document: document2 } = new JSDOM(html2).window;
    return new URL(document2.querySelector('div#output > p.outfile > video > source').src, res2.url).toString();
}

// Función para convertir un archivo WebP a PNG
async function webp2png(source) {
    let form = new FormData();
    let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
    const blob = !isUrl && new Blob([source.toArrayBuffer()]);
    form.append('new-image-url', isUrl ? source : '');
    form.append('new-image', isUrl ? '' : blob, 'image.webp');
    
    let res = await fetch('https://ezgif.com/webp-to-png', {
        method: 'POST',
        body: form,
    });

    let html = await res.text();
    let { document } = new JSDOM(html).window;
    let form2 = new FormData();
    let obj = {};

    // Extraemos los valores necesarios para hacer un segundo POST
    for (let input of document.querySelectorAll('form input[name]')) {
        obj[input.name] = input.value;
        form2.append(input.name, input.value);
    }

    // Realizamos el segundo POST para obtener el archivo final
    let res2 = await fetch('https://ezgif.com/webp-to-png/' + obj.file, {
        method: 'POST',
        body: form2,
    });

    let html2 = await res2.text();
    let { document: document2 } = new JSDOM(html2).window;
    return new URL(document2.querySelector('div#output > p.outfile > img').src, res2.url).toString();
}

// Exportamos las funciones para su uso
export { webp2mp4, webp2png };