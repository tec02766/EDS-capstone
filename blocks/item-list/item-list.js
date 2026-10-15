function renderPage(items, container, page, limit) {
  container.innerHTML = '';

  const start = page * limit;
  const end = start + limit;
  const paginatedItems = items.slice(start, end);

  // Generate the HTML for the current page items
  paginatedItems.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.classList.add('item-card');
    itemEl.innerHTML = `
      <h3>${item.title || item.Title || 'Untitled Item'}</h3>
      <p>${item.description || item.Description || ''}</p>
    `;
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
    block.innerHTML = '<p class="error">Error loading items.</p>';
  }
}
