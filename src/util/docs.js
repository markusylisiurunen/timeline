/**
 * @overview Documentation helpers for a CLI interface.
 */

module.exports = {
  wrap(blocks) {
    return blocks.join('\n');
  },

  block: {
    text(content) {
      return `\n${content}`;
    },

    list(title, rows) {
      let content = `\n${title}:\n`;

      // Find the widest columns
      const columnWidths = rows
        .reduce((widths, row) => {
          row.forEach((col, i) => {
            widths[i] = [...(widths[i] || []), col.length];
          });

          return widths;
        }, [])
        .map(group => Math.max(...group));

      // Push each row to the content
      rows.forEach(row => {
        const columns = row.map((col, i) => col.padEnd(columnWidths[i]));
        content += `\n  ${columns.join(' ')}`;
      });

      return content;
    },
  },
};
