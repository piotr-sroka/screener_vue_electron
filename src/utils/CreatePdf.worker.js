import pdfMake from "pdfmake/build/pdfmake";

self.addEventListener("message", e => {
	const pdf = pdfMake.createPdf(e.data);
	pdf.getBuffer(buffer => {
		postMessage(buffer);
	});
});
