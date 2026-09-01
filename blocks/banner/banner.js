export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const image = cells[0];
    const content = cells[1];

    image.classList.add('banner-image');
    content.classList.add('banner-content');
  });
}
