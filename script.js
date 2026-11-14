let allProducts = [];

async function fetchProducts() {
  try {
    let res = await fetch("https://fakestoreapi.com/products");
    let data = await res.json();
    allProducts = data;

    let uniqueCategories = [...new Set(allProducts.map((p) => p.category))];

    uniqueCategories.forEach((c) => {
      category.innerHTML += `<option value="${c}">${c}</option>`;
    });

    renderProducts(allProducts);
    renderPaginationControls(allProducts);
  } catch (error) {
    console.error("error", error);
  }
}

fetchProducts();

let grid = document.getElementById("productsGrid");
let currentPage = 1;
let productsPerPage = 6;

function renderProducts(arr) {
  if (arr.length == 0) {
    grid.innerHTML = '<p class="no-products">No products found.</p>';
    return;
  }

  let startIndex = (currentPage - 1) * productsPerPage;
  let endIndex = startIndex + productsPerPage;
  let paginatedProducts = arr.slice(startIndex, endIndex);

  let htmlCode = "";
  paginatedProducts.forEach((item) => {
    htmlCode += `
      <div class="product-card">
        <img src="${item.image}" alt="img" class="product-image">
        <div class="product-info">
          <h3 class="product-title">${item.title}</h3>
          <p class="product-price">$${item.price}</p>
          
          <p class="product-rating">
            Rate : ${item.rating.rate} <span>(${item.rating.count} reviews)</span>
          </p>

           <div class="action-buttons">        
            <button class="btn btn-green add-to-cart-btn" onclick="addToCart(${item.id})">
              Add to Cart
            </button>
            <button class="btn btn-blue" onclick="showDetails(${item.id})">
              Details
            </button>
          </div>
          
        </div>
      </div> 
    `;
  });

  grid.innerHTML = htmlCode;
}

let category = document.getElementById("categorySelect");
let next = document.getElementById("nextBtn");
let pageNumbersContainer = document.getElementById("pageNumbers");

function renderPaginationControls(data) {
  if (!pageNumbersContainer) return;
  let totalPages = Math.ceil(data.length / productsPerPage);
  pageNumbersContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    let btn = document.createElement("button");
    btn.innerText = i;
    btn.className = "page-num-btn";

    if (currentPage == i) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      currentPage = i;
      renderProducts(data);
      renderPaginationControls(data);
    });

    pageNumbersContainer.appendChild(btn);
  }
}

next.addEventListener("click", () => {
  let dataToRender = allProducts;
  if (category.value != "") {
    dataToRender = allProducts.filter((p) => p.category == category.value);
  }

  let totalPages = Math.ceil(dataToRender.length / productsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderProducts(dataToRender);
    renderPaginationControls(dataToRender);
  }
});

let prev = document.getElementById("prevBtn");
prev.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;

    let dataToRender = allProducts;
    if (category.value != "") {
      dataToRender = allProducts.filter((p) => p.category == category.value);
    }

    renderProducts(dataToRender);
    renderPaginationControls(dataToRender);
  }
});

let modal = document.getElementById("productModal");
let modalBody = document.getElementById("modalBody");

function showDetails(id) {
  let product = allProducts.find((x) => x.id == id);

  modalBody.innerHTML = `
    <img src="${product.image}" alt="img" class="modal-image">
    <h3 class="title">${product.title}</h3>
    <p class="description">${product.description}</p>
    <p class="modal-rating"> Rate : ${product.rating.rate} </p>
    <h3 class="product-price">$${product.price}</h3>
  `;
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

let applyBtn = document.getElementById("applyFiltersBtn");
let searchInput = document.getElementById("searchInput");
let minPrice = document.getElementById("minPriceInput");
let maxPrice = document.getElementById("maxPriceInput");

applyBtn.addEventListener("click", () => {
  let filteredProducts = allProducts;

  if (searchInput.value != "") {
    filteredProducts = filteredProducts.filter((p) =>
      p.title.toLowerCase().includes(searchInput.value.toLowerCase()),
    );
  }

  if (category.value != "") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category == category.value,
    );
  }

  if (minPrice.value != "") {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= Number(minPrice.value),
    );
  }

  if (maxPrice.value != "") {
    filteredProducts = filteredProducts.filter(
      (p) => p.price <= Number(maxPrice.value),
    );
  }

  currentPage = 1;
  renderProducts(filteredProducts);
  renderPaginationControls(filteredProducts);
});

let sortSelect = document.getElementById("sortSelect");

sortSelect.addEventListener("change", () => {
  let v = sortSelect.value;

  if (v == "price-asc") {
    allProducts.sort((x, y) => x.price - y.price);
  } else if (v == "price-desc") {
    allProducts.sort((x, y) => y.price - x.price);
  } else if (v == "rate-asc") {
    allProducts.sort((x, y) => x.rating.rate - y.rating.rate);
  } else if (v == "rate-desc") {
    allProducts.sort((x, y) => y.rating.rate - x.rating.rate);
  } else if (v == "name-asc") {
    allProducts.sort((x, y) => x.title.localeCompare(y.title));
  } else if (v == "name-desc") {
    allProducts.sort((x, y) => y.title.localeCompare(x.title));
  }

  currentPage = 1;
  renderProducts(allProducts);
  renderPaginationControls(allProducts);
});

let cart = [];

function addToCart(id) {
  let product = allProducts.find((x) => x.id == id);

  let existingItem = null;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id == id) {
      existingItem = cart[i];
      break;
    }
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((x) => x.id != id);
  renderCart();
}

function renderCart() {
  let cartList = document.getElementById("cartList");
  let totalQuantityEl = document.getElementById("totalQuantity");
  let totalPriceEl = document.getElementById("totalPrice");

  cartList.innerHTML = "";
  let totalPrice = 0;
  let totalQty = 0;

  cart.forEach((item) => {
    totalQty += item.quantity;
    totalPrice += item.price * item.quantity;

    let li = document.createElement("li");
    li.innerHTML = `
      <div class="cart-item-row">
        <span>${item.title} $${item.price} (Qty: ${item.quantity})</span>
        <button class="btn btn-remove" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    `;
    cartList.appendChild(li);
  });

  if (totalQuantityEl) {
    totalQuantityEl.innerText = `Total Quantity: ${totalQty}`;
  }
  if (totalPriceEl) {
    totalPriceEl.innerText = `Total Price: $${totalPrice.toFixed(2)}`;
  }
}
