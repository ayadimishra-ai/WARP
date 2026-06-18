function DownloadCSV<T extends Record<string, any>>(
  datasets: T[][],
  titles: string[],
  headerNameChange?: boolean[]
) {
  datasets.forEach((data, index) => {
    const originalTitle = titles[index];
    const isNameChange = headerNameChange ? headerNameChange[index] : false;
    const titleForHeader = isNameChange
      ? originalTitle.replace(" - PieChart", "")
      : "Period";

    const allKeys = data.reduce(
      (keys, item) => [...keys, ...Object.keys(item)],
      [] as (keyof T)[]
    );

    const uniqueKeys = Array.from(new Set(allKeys));

    // Create headers, replacing the first key conditionally
    const headers = uniqueKeys.map((key, i) =>
      i === 0
        ? titleForHeader
        : key.toString().charAt(0).toUpperCase() + key.toString().slice(1)
    );

    const csvContent = [headers.join(",")]
      .concat(
        data.map((row) =>
          uniqueKeys
            .map((key) => {
              // Handle "address" field to be enclosed in double quotes
              if (key === "address" && row[key] !== undefined) {
                return `"${String(row[key]).replace(/"/g, '""')}"`;
              }
              return row[key] !== undefined
                ? String(row[key]).replace(/,/g, "")
                : "";
            })
            .join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${originalTitle}.csv`); // Use the original title for the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

export default DownloadCSV;
