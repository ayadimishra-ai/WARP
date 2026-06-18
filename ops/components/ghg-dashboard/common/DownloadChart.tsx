import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const DownloadChart = (
  ref: React.RefObject<HTMLDivElement>,
  title: string,
  format: "png" | "pdf"
) => {
  if (!ref.current) return;

  if (format === "png") {
    html2canvas(ref.current, {
      backgroundColor: "#fff",
      scale: 2,
    }).then((canvas) => {
      const dataUrl = canvas.toDataURL();
      const link = document.createElement("a");
      link.download = `${title}.png`;
      link.href = dataUrl;
      link.click();
    });
  } else if (format === "pdf") {
    html2canvas(ref.current, {
      backgroundColor: "#fff",
      scale: 2,
    }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${title}.pdf`);
    });
  }
};
