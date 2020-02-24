import pdfMake from "pdfmake/build/pdfmake";

self.addEventListener("message", e => {
	const pdf = pdfMake.createPdf(e.data);
	pdf.getBlob(blob => {
		postMessage(blob);
	});
});
