function renderPage(items, container, page, limit) {
  container.innerHTML = '';

  const start = page * limit;
  const end = start + limit;
  const paginatedItems = items.slice(start, end);

  // Generate the HTML for the current page items
  paginatedItems.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.classList.add('item-card');

    // Extract all valid object property keys for this row
    const keys = Object.keys(item);

    if (keys.length > 0) {
      // 1. Convention: Use the very first column key as the main bold title/header
      const titleKey = keys[0];
      const titleValue = item[titleKey] || 'N/A';

      let htmlContent = `<h3>${titleValue}</h3>`;

      // 2. Loop through all remaining keys dynamically to build out metadata lines
      keys.slice(1).forEach((key) => {
        // Skip metadata keys if they happen to exist in your indexing rules
        if (key.startsWith(':')) return;

        const value = item[key] !== undefined && item[key] !== null ? item[key] : '';
        htmlContent += `<p><strong>${key}:</strong> ${value}</p>`;
      });

      itemEl.innerHTML = htmlContent;
    } else {
      itemEl.innerHTML = '<p><em>Empty Row</em></p>';
    }

    container.append(itemEl);
  });
}

/**
 * Renders pagination controls (Prev / Page Indicators / Next).
 */
function renderPagination(
  items,
  controlsContainer,
  listContainer,
  currentPage,
  limit,
  onPageChange,
) {
  controlsContainer.innerHTML = '';
  const totalPages = Math.ceil(items.length / limit);
  if (totalPages <= 1) return; // No pagination needed for a single page

  // Previous Button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = currentPage === 0;
  prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
  controlsContainer.append(prevBtn);

  // Status Indicator Text
  const status = document.createElement('span');
  status.textContent = ` Page ${currentPage + 1} of ${totalPages} `;
  status.classList.add('pagination-status');
  controlsContainer.append(status);

  // Next Button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages - 1;
  nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
  controlsContainer.append(nextBtn);
}
export default async function decorate(block) {
  const linkEl = block.querySelector('a');
  const jsonUrl = linkEl ? linkEl.getAttribute('href') : '';

  if (!jsonUrl) {
    block.innerHTML = '<p class="error">Please provide a valid spreadsheet JSON link.</p>';
    return;
  }

  block.innerHTML = '';

  const listContainer = document.createElement('div');
  listContainer.classList.add('item-list-entries');

  const paginationContainer = document.createElement('div');
  paginationContainer.classList.add('item-list-pagination');

  block.append(listContainer, paginationContainer);

  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) throw new Error('Network error fetching sheet data');
    const json = await response.json();
    const items = json.data || [];
    if (items.length === 0) {
      listContainer.innerHTML = '<p>No items found in the spreadsheet.</p>';
      return;
    }

    let currentPage = 0;
    const itemsPerPage = 20;

    const updateView = (newPage) => {
      currentPage = newPage;
      renderPage(items, listContainer, currentPage, itemsPerPage);
      renderPagination(
        items,
        paginationContainer,
        listContainer,
        currentPage,
        itemsPerPage,
        updateView,
      );
    };

    updateView(currentPage);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to render item-list block:', error);
    block.innerHTML = '<p class="error">Error loading items.</p>';
  }
}
