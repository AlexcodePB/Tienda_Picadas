// script.js

// ======== EXISTING FUNCTIONALITY ========

// MARTILLO DE MENU
document.addEventListener("DOMContentLoaded", function () {
  const martilloToggle = document.getElementById("martilloToggle");
  const martilloIcon = document.getElementById("martilloIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");

  let dropdownVisible = false;

  martilloToggle.addEventListener("click", function (event) {
    event.preventDefault();
    dropdownVisible = !dropdownVisible;

    dropdownMenu.classList.toggle("show", dropdownVisible);
    martilloIcon.classList.add("rotated");

    // Remover la clase "rotated" después de 0.5 segundos (la duración de la transición)
    setTimeout(function () {
      martilloIcon.classList.remove("rotated");
    }, 500);
  });
});

// MENU LOGIN REGISTER
document.addEventListener("DOMContentLoaded", function () {
  const userToggle = document.getElementById("userToggle");
  const dropdownMenuUser = document.getElementById("dropdownMenuUser");

  let dropdownVisibleUser = false;

  userToggle.addEventListener("click", function (event) {
    event.preventDefault();
    dropdownVisibleUser = !dropdownVisibleUser;

    dropdownMenuUser.classList.toggle("show", dropdownVisibleUser);
  });
});

// MODAL PARA REGISTER
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");
  const emailInput = document.getElementById("regEmail");
  const emailConfirm = document.getElementById("regEmailConfirm");
  const pwdInput = document.getElementById("regPassword");
  const pwdConfirm = document.getElementById("regPasswordConfirm");
  const btn = document.getElementById("regBtn");
  const btnText = document.getElementById("regBtnText");
  const spinner = document.getElementById("regBtnSpinner");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.classList.add("was-validated");

    const email = emailInput.value.trim();
    const email2 = emailConfirm.value.trim();
    const pwd = pwdInput.value;
    const pwd2 = pwdConfirm.value;
    let valid = true;

    // Validar que los correos coincidan
    if (email !== email2) {
      emailConfirm.setCustomValidity("no match");
      valid = false;
    } else {
      emailConfirm.setCustomValidity("");
    }

    // Validar que las contraseñas coincidan
    if (pwd !== pwd2) {
      pwdConfirm.setCustomValidity("no match");
      valid = false;
    } else {
      pwdConfirm.setCustomValidity("");
    }

    if (!form.checkValidity() || !valid) return;

    // Construir el objeto newUser con la misma estructura que usa renderUsersTable
    const newUser = {
      id: Date.now().toString(), // ID único
      name: form.regName.value.trim(), // Nombre completo
      email: email, // Correo
      password: pwd, // Contraseña
      role: "user", // Por defecto “user”
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Obtener array de usuarios, o inicializar vacío
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Verificar si ya existe un usuario con ese email
    const existingUser = users.find((u) => u.email === newUser.email);
    if (existingUser) {
      alert("El usuario ya existe. Por favor, inicia sesión.");
      return;
    }

    // Agregar nuevo usuario y guardar en localStorage
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Mostrar spinner
    btn.disabled = true;
    btnText.textContent = "Registrando...";
    spinner.classList.remove("d-none");

    setTimeout(() => {
      // 1) Cerrar modal
      bootstrap.Modal.getInstance(
        document.getElementById("registroModal")
      ).hide();

      // 2) Resetear formulario
      form.reset();
      form.classList.remove("was-validated");
      btn.disabled = false;
      btnText.textContent = "Registrarse";
      spinner.classList.add("d-none");

      // 3) Mostrar toast de “Registro exitoso”
      const toastEl = document.getElementById("registerToast");
      const bsToast = new bootstrap.Toast(toastEl);
      bsToast.show();

      // 4) Si estamos en users.html, refrescar tabla
      if (typeof renderUsersTable === "function") {
        renderUsersTable();
      }
    }, 1500);
  });
});

// MODAL PARA LOGIN
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const loginBtnText = document.getElementById("loginBtnText");
  const loginSpinner = document.getElementById("loginBtnSpinner");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    loginForm.classList.add("was-validated");

    if (!loginForm.checkValidity()) return;

    loginBtn.disabled = true;
    loginBtnText.textContent = "Entrando...";
    loginSpinner.classList.remove("d-none");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const email = loginEmail.value.trim();
    const pwd = loginPassword.value;
    const user = users.find((u) => u.email === email && u.password === pwd);

    setTimeout(() => {
      if (user) {
        // 1) Guardar en localStorage el usuario “logueado”
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          })
        );

        // 2) Cerrar modal de login
        bootstrap.Modal.getInstance(
          document.getElementById("loginModal")
        ).hide();

        // 3) Mostrar toast de bienvenida (opcional)
        const toastEl = document.getElementById("loginToast");
        toastEl.querySelector(
          ".toast-body"
        ).textContent = `¡Bienvenido, ${user.name}!`;
        const bsToast = new bootstrap.Toast(toastEl);
        bsToast.show();

        // 4) Redirigir en 1.5 s a adminPanel.html
        setTimeout(() => {
          window.location.href = "adminPanel.html";
        }, 1500);
      } else {
        alert("Credenciales incorrectas.");
        loginBtn.disabled = false;
        loginBtnText.textContent = "Entrar";
        loginSpinner.classList.add("d-none");
      }
    }, 1500);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("./productos.json")
    .then((response) => response.json())
    .then((data) => {
      renderProducts(data);
    })
    .catch((error) => {
      console.error("Error al cargar productos:", error);
    });
});

function renderProducts(products) {
  const categories = {};

  products.forEach((product) => {
    if (!categories[product.category]) {
      categories[product.category] = document.querySelector(
        `[data-category="${product.category}"]`
      );
    }

    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    col.innerHTML = `
      <div class="card h-100 shadow-sm product-card" data-id="${product.id}">
        <div class="img-hover-zoom">
          <img src="${product.image}" class="card-img-top" alt="${
      product.name
    }">
        </div>
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-muted small">${product.ingredients || ""}</p>
          <p class="card-text fw-bold text-success">$${product.price.toLocaleString()}</p>
        </div>
        <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between">
          <button class="btn btn-outline-primary btn-sm" onclick="showProductDetails(${
            product.id
          })">Ver más</button>
          <button class="btn btn-dark btn-sm" onclick="addToCartFromList(${
            product.id
          })"><i class="bi bi-cart-plus"></i></button>
        </div>
      </div>
    `;

    if (categories[product.category]) {
      categories[product.category].appendChild(col);
    }
  });
}

function showProductDetails(id) {
  // Lógica para mostrar detalles (se asume implementada)
}

function addToCartFromList(id) {
  // Lógica para agregar al carrito desde la lista
}

// COMPLETAR MODAL DESCRIPTIVO CON DATOS DE CARD DINÁMICAS
function showProductDetails(productId) {
  fetch("productos.json")
    .then((response) => response.json())
    .then((products) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        document.getElementById("productModalLabel").innerText = product.name;
        document.getElementById("productName").innerText = product.name;
        document.getElementById(
          "productIngredients"
        ).innerText = `Ingredientes: ${product.ingredients}`;
        document.getElementById(
          "productPrice"
        ).innerText = `Precio: $${new Intl.NumberFormat("es-ES").format(
          product.price
        )}`;

        const carouselInner = document.querySelector(
          "#productCarousel .carousel-inner"
        );
        const carouselIndicators = document.querySelector(
          "#productCarousel .carousel-indicators"
        );

        // Limpiar el contenido anterior
        carouselInner.innerHTML = "";
        carouselIndicators.innerHTML = "";

        // Añadir imágenes al carrusel
        const images = [
          product.image,
          product.image2,
          product.image3,
          product.image4,
        ].filter(Boolean);
        images.forEach((imgSrc, index) => {
          const isActive = index === 0 ? "active" : "";
          carouselInner.innerHTML += `
            <div class="carousel-item ${isActive}">
              <img src="${imgSrc}" class="d-block w-100" alt="${product.name}">
            </div>
          `;
          carouselIndicators.innerHTML += `
            <button type="button" data-bs-target="#productCarousel" data-bs-slide-to="${index}" class="${isActive}" aria-current="true" aria-label="Slide ${
            index + 1
          }"></button>
          `;
        });

        // Restablecer la cantidad a 1
        document.getElementById("quantity").value = 1;

        document
          .querySelector("#productModal button.btn-primary")
          .setAttribute(
            "onclick",
            `addToCart(${product.id}, document.getElementById('quantity').value)`
          );

        const productModal = new bootstrap.Modal(
          document.getElementById("productModal")
        );
        productModal.show();
      }
    })
    .catch((error) =>
      console.error("Error al cargar los detalles del producto:", error)
    );
}

// AGREGAR A CARRITO
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(productId, quantity = 1) {
  fetch("productos.json")
    .then((response) => response.json())
    .then((products) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const existingProductIndex = cart.findIndex(
          (item) => item.id === product.id
        );
        if (existingProductIndex > -1) {
          // Actualizar cantidad si el producto ya está en el carrito
          cart[existingProductIndex].quantity += parseInt(quantity);
        } else {
          // Añadir nuevo producto al carrito
          const cartItem = {
            ...product,
            cartItemId: Date.now(),
            quantity: parseInt(quantity),
          };
          cart.push(cartItem);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCart();
        showAddToCartModal(); // Mostrar el modal de confirmación
      }
    })
    .catch((error) => console.error("Error al agregar al carrito:", error));
}

function showAddToCartModal() {
  const addToCartModal = new bootstrap.Modal(
    document.getElementById("addToCartModal")
  );
  addToCartModal.show();

  setTimeout(() => {
    addToCartModal.hide();
  }, 3500);

  document
    .getElementById("addToCartModal")
    .addEventListener("click", function (event) {
      if (event.target === this) {
        addToCartModal.hide();
      }
    });
}

function updateCart() {
  const cartContainer = document.querySelector(".cart-cont .row");
  cartContainer.innerHTML = "";

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "";

    cartItem.innerHTML = `
      <div class="card mb-3">
        <div class="row g-0">
          <div class="col-md-4">
            <img src="${item.image}" class="card-img-top" alt="${item.name}">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text">Precio unitario: $${new Intl.NumberFormat(
                "es-ES"
              ).format(item.price)}</p>
              <p class="card-text">Cantidad: ${item.quantity}</p>
              <p class="card-text">Subtotal: $${new Intl.NumberFormat(
                "es-ES"
              ).format(item.price * item.quantity)}</p>
              <div class="input-group mb-3">
                <button class="btn btn-outline-secondary" type="button" onclick="updateItemQuantity(${
                  item.cartItemId
                }, -1)">-</button>
                <input type="text" class="form-control text-center" value="${
                  item.quantity
                }" disabled />
                <button class="btn btn-outline-secondary" type="button" onclick="updateItemQuantity(${
                  item.cartItemId
                }, 1)">+</button>
              </div>
              <button onclick="removeFromCart(${
                item.cartItemId
              })" class="btn btn-danger btn-sm">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelector(
    ".cart-total"
  ).innerText = `Total: $${new Intl.NumberFormat("es-ES").format(total)}`;
  document.querySelector(".cart-count").innerText = totalQuantity;
}

function removeFromCart(cartItemId) {
  cart = cart.filter((item) => item.cartItemId !== cartItemId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function updateItemQuantity(cartItemId, change) {
  const itemIndex = cart.findIndex((item) => item.cartItemId === cartItemId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
  }
}

// Incrementar y decrementar cantidad en el modal
document.addEventListener("click", function (event) {
  if (event.target && event.target.id === "incrementQuantity") {
    let quantityInput = document.getElementById("quantity");
    quantityInput.value = parseInt(quantityInput.value) + 1;
  }

  if (event.target && event.target.id === "decrementQuantity") {
    let quantityInput = document.getElementById("quantity");
    if (parseInt(quantityInput.value) > 1) {
      quantityInput.value = parseInt(quantityInput.value) - 1;
    }
  }
});

// BÚSQUEDA DE PRODUCTOS EN NAVBAR
document.addEventListener("DOMContentLoaded", function () {
  const searchInputNavbar = document.getElementById("searchInput");
  const searchSuggestions = document
    .getElementById("searchSuggestions")
    ?.querySelector(".list-group");

  if (!searchInputNavbar || !searchSuggestions) return;

  function loadProducts(callback) {
    fetch("productos.json")
      .then((response) => response.json())
      .then((data) => callback(data))
      .catch((error) => console.error("Error al cargar productos:", error));
  }

  function showSuggestions(products, searchTerm) {
    searchSuggestions.innerHTML = "";

    if (searchTerm.length === 0) {
      searchSuggestions.style.display = "none";
      return;
    }

    const matches = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );

    if (matches.length > 0) {
      matches.forEach((match) => {
        const suggestion = document.createElement("li");
        suggestion.classList.add("list-group-item");
        suggestion.innerHTML = `
          <a href="${match.url}" class="nav-link-search">
            <div class="row">
              <div class="col-auto">
                <img src="${match.image}" alt="${match.name}" class="img-fluid" style="max-width: 100px;">
              </div>
              <div class="col">
                <h6 class="card-title">${match.name}</h6>
                <p class="card-text">$${match.price}</p>
              </div>
            </div>
          </a>
        `;
        searchSuggestions.appendChild(suggestion);
      });
      searchSuggestions.style.display = "block";
    } else {
      searchSuggestions.style.display = "none";
    }
  }

  function handleVisibility() {
    if (searchInputNavbar.value.trim().length > 0) {
      searchSuggestions.parentElement.style.display = "block";
    } else {
      searchSuggestions.parentElement.style.display = "none";
    }
  }

  searchInputNavbar.addEventListener("input", function () {
    const searchTerm = searchInputNavbar.value.trim().toLowerCase();
    loadProducts(function (products) {
      showSuggestions(products, searchTerm);
      handleVisibility();
    });
  });

  searchInputNavbar.addEventListener("focus", function () {
    handleVisibility();
  });

  document.addEventListener("click", function (event) {
    if (
      !searchInputNavbar.contains(event.target) &&
      !searchSuggestions.contains(event.target)
    ) {
      searchSuggestions.parentElement.style.display = "none";
    }
  });
});

// ======== DYNAMIC DASHBOARDS & SIDEBAR LOGIC ========

// UTILIDADES COMUNES
function generateId() {
  return Date.now().toString();
}

// LOCALSTORAGE USERS
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// LOCALSTORAGE PRODUCTS
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}
function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

// LOCALSTORAGE ORDERS
function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}
function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// RENDERIZADO USUARIOS
function renderUsersTable(filterText = "", filterRole = "") {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  const users = getUsers();
  tbody.innerHTML = "";

  let filtered = users;
  if (filterText) {
    const term = filterText.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }
  if (filterRole) {
    filtered = filtered.filter((u) => u.role === filterRole);
  }

  filtered.forEach((user, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td class="text-capitalize">${user.role}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1 btn-edit-user" data-id="${
          user.id
        }">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-delete-user" data-id="${
          user.id
        }">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// RENDERIZADO PRODUCTOS
function renderProductsTable(filterText = "", filterCategory = "") {
  const tbody = document.getElementById("productsTableBody");
  if (!tbody) return;
  const products = getProducts();
  tbody.innerHTML = "";

  let filtered = products;
  if (filterText) {
    const term = filterText.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }
  if (filterCategory) {
    filtered = filtered.filter((p) => p.category === filterCategory);
  }

  filtered.forEach((product, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="product-img-cell">
        <img src="${product.image || "https://via.placeholder.com/60"}"
             alt="${product.name}"
             class="img-fluid"
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; cursor: pointer;"
            onclick="showImagePreview('${
              product.image || "https://via.placeholder.com/300"
            }')">
      </td>
      <td>${product.name}</td>
      <td class="text-capitalize">${product.category}</td>
      <td>AR$ ${parseFloat(product.price).toFixed(2)}</td>
      <td>${product.description}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1 btn-edit-product" data-id="${
          product.id
        }">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-delete-product" data-id="${
          product.id
        }">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// RENDERIZADO ÓRDENES
function renderOrdersTable(filterText = "", filterStatus = "") {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;
  const orders = getOrders();
  tbody.innerHTML = "";

  let filtered = orders;
  if (filterText) {
    const term = filterText.toLowerCase();
    filtered = filtered.filter((o) => o.email.toLowerCase().includes(term));
  }
  if (filterStatus) {
    filtered = filtered.filter((o) => o.status === filterStatus);
  }

  filtered.forEach((order, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${order.email}</td>
      <td>${order.items}</td>
      <td>AR$ ${parseFloat(order.total).toFixed(2)}</td>
      <td class="text-capitalize">${order.status}</td>
      <td>${order.date}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1 btn-edit-order" data-id="${
          order.id
        }">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-delete-order" data-id="${
          order.id
        }">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// INICIALIZACIÓN USERS DASHBOARD
function initUsersDashboard() {
  const usersTableBody = document.getElementById("usersTableBody");
  if (!usersTableBody) return;

  let selectedDeleteUserId = null;
  const userModal = new bootstrap.Modal(document.getElementById("userModal"));
  const deleteUserModal = new bootstrap.Modal(
    document.getElementById("confirmDeleteModal")
  );

  const btnAdd = document.getElementById("btnAddUser");
  const userForm = document.getElementById("userForm");
  const searchInput = document.getElementById("searchInput");
  const filterRole = document.getElementById("filterRole");
  const btnClear = document.getElementById("btnClearFilters");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userRole = document.getElementById("userRole");
  const userPassword = document.getElementById("userPassword");
  const userIdField = document.getElementById("userId");
  const userModalLabel = document.getElementById("userModalLabel");
  const userModalSubmit = document.getElementById("userModalSubmit");
  const deleteConfirmBtn = document.getElementById("deleteUserConfirm");

  renderUsersTable();

  btnAdd.addEventListener("click", () => {
    userForm.reset();
    userForm.classList.remove("was-validated");
    userIdField.value = "";
    userModalLabel.textContent = "Agregar Usuario";
    userModalSubmit.innerHTML = '<i class="bi bi-check-lg me-1"></i>Guardar';
    userModal.show();
  });

  userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    userForm.classList.add("was-validated");
    if (!userForm.checkValidity()) return;

    const id = userIdField.value;
    const name = userName.value.trim();
    const email = userEmail.value.trim();
    const role = userRole.value;
    const password = userPassword.value;

    let users = getUsers();
    if (id) {
      users = users.map((u) =>
        u.id === id ? { id, name, email, role, password } : u
      );
    } else {
      users.push({ id: generateId(), name, email, role, password });
    }
    saveUsers(users);
    userModal.hide();
    renderUsersTable(searchInput.value.trim(), filterRole.value);
  });

  searchInput.addEventListener("input", () => {
    renderUsersTable(searchInput.value.trim(), filterRole.value);
  });
  filterRole.addEventListener("change", () => {
    renderUsersTable(searchInput.value.trim(), filterRole.value);
  });
  btnClear.addEventListener("click", () => {
    searchInput.value = "";
    filterRole.value = "";
    renderUsersTable();
  });

  usersTableBody.addEventListener("click", (e) => {
    if (e.target.closest(".btn-edit-user")) {
      const id = e.target.closest(".btn-edit-user").dataset.id;
      const users = getUsers();
      const user = users.find((u) => u.id === id);
      if (!user) return;
      userIdField.value = user.id;
      userName.value = user.name;
      userEmail.value = user.email;
      userRole.value = user.role;
      userPassword.value = user.password;
      userModalLabel.textContent = "Editar Usuario";
      userModalSubmit.innerHTML =
        '<i class="bi bi-pencil-square me-1"></i>Actualizar';
      userModal.show();
    }
    if (e.target.closest(".btn-delete-user")) {
      selectedDeleteUserId = e.target.closest(".btn-delete-user").dataset.id;
      deleteUserModal.show();
    }
  });

  deleteConfirmBtn.addEventListener("click", () => {
    let users = getUsers().filter((u) => u.id !== selectedDeleteUserId);
    saveUsers(users);
    deleteUserModal.hide();
    renderUsersTable(searchInput.value.trim(), filterRole.value);
  });
}

// INICIALIZACIÓN PRODUCTS DASHBOARD
function initProductsDashboard() {
  const productsTableBody = document.getElementById("productsTableBody");
  if (!productsTableBody) return;

  let selectedDeleteProductId = null;
  const productModal = new bootstrap.Modal(
    document.getElementById("productModal")
  );
  const deleteProductModal = new bootstrap.Modal(
    document.getElementById("confirmDeleteProductModal")
  );

  const btnAdd = document.getElementById("btnAddProduct");
  const productForm = document.getElementById("productForm");
  const searchProduct = document.getElementById("searchProduct");
  const filterCategory = document.getElementById("filterCategory");
  const btnClear = document.getElementById("btnClearProdFilters");
  const productName = document.getElementById("productName");
  const productCategory = document.getElementById("productCategory");
  const productPrice = document.getElementById("productPrice");
  const productDesc = document.getElementById("productDesc");
  const productIdField = document.getElementById("productId");
  const productModalLabel = document.getElementById("productModalLabel");
  const productModalSubmit = document.getElementById("productModalSubmit");
  const deleteProductConfirmBtn = document.getElementById(
    "deleteProductConfirm"
  );

  renderProductsTable();

  btnAdd.addEventListener("click", () => {
    productForm.reset();
    productForm.classList.remove("was-validated");
    productIdField.value = "";
    productModalLabel.textContent = "Agregar Producto";
    productModalSubmit.innerHTML = '<i class="bi bi-check-lg me-1"></i>Guardar';
    productModal.show();
  });

  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    productForm.classList.add("was-validated");
    if (!productForm.checkValidity()) return;

    const id = productIdField.value;
    const name = productName.value.trim();
    const category = productCategory.value;
    const price = productPrice.value;
    const description = productDesc.value.trim();

    let imageBase64 = "";

    const imageFile = document.getElementById("productImage").files[0];
    if (imageFile) {
      imageBase64 = await toBase64(imageFile);
    }

    let products = getProducts();
    if (id) {
      products = products.map((p) =>
        p.id === id
          ? {
              ...p,
              name,
              category,
              price,
              description,
              image: imageBase64 || p.image,
            }
          : p
      );
    } else {
      products.push({
        id: generateId(),
        name,
        category,
        price,
        description,
        image: imageBase64,
      });
    }

    saveProducts(products);
    productModal.hide();
    renderProductsTable(searchProduct.value.trim(), filterCategory.value);
  });

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  searchProduct.addEventListener("input", () => {
    renderProductsTable(searchProduct.value.trim(), filterCategory.value);
  });
  filterCategory.addEventListener("change", () => {
    renderProductsTable(searchProduct.value.trim(), filterCategory.value);
  });
  btnClear.addEventListener("click", () => {
    searchProduct.value = "";
    filterCategory.value = "";
    renderProductsTable();
  });

  productsTableBody.addEventListener("click", (e) => {
    if (e.target.closest(".btn-edit-product")) {
      const id = e.target.closest(".btn-edit-product").dataset.id;
      const products = getProducts();
      const product = products.find((p) => p.id === id);
      if (!product) return;
      productIdField.value = product.id;
      productName.value = product.name;
      productCategory.value = product.category;
      productPrice.value = product.price;
      productDesc.value = product.description;
      productModalLabel.textContent = "Editar Producto";
      productModalSubmit.innerHTML =
        '<i class="bi bi-pencil-square me-1"></i>Actualizar';
      productModal.show();
    }
    if (e.target.closest(".btn-delete-product")) {
      selectedDeleteProductId = e.target.closest(".btn-delete-product").dataset
        .id;
      deleteProductModal.show();
    }
  });

  deleteProductConfirmBtn.addEventListener("click", () => {
    let products = getProducts().filter(
      (p) => p.id !== selectedDeleteProductId
    );
    saveProducts(products);
    deleteProductModal.hide();
    renderProductsTable(searchProduct.value.trim(), filterCategory.value);
  });
}

function showImagePreview(src) {
  const img = document.getElementById("previewLargeImage");
  img.src = src;
  const modal = new bootstrap.Modal(
    document.getElementById("imagePreviewModal")
  );
  modal.show();
}

// INICIALIZACIÓN ORDERS DASHBOARD
function initOrdersDashboard() {
  const ordersTableBody = document.getElementById("ordersTableBody");
  if (!ordersTableBody) return;

  let selectedDeleteOrderId = null;
  const orderModal = new bootstrap.Modal(document.getElementById("orderModal"));
  const deleteOrderModal = new bootstrap.Modal(
    document.getElementById("confirmDeleteOrderModal")
  );

  const btnAdd = document.getElementById("btnAddOrder");
  const orderForm = document.getElementById("orderForm");
  const searchOrder = document.getElementById("searchOrder");
  const filterStatus = document.getElementById("filterStatus");
  const btnClear = document.getElementById("btnClearOrderFilters");
  const orderEmail = document.getElementById("orderEmail");
  const orderItems = document.getElementById("orderItems");
  const orderTotal = document.getElementById("orderTotal");
  const orderStatus = document.getElementById("orderStatus");
  const orderDate = document.getElementById("orderDate");
  const orderIdField = document.getElementById("orderId");
  const orderModalLabel = document.getElementById("orderModalLabel");
  const orderModalSubmit = document.getElementById("orderModalSubmit");
  const deleteOrderConfirmBtn = document.getElementById("deleteOrderConfirm");

  renderOrdersTable();

  btnAdd.addEventListener("click", () => {
    orderForm.reset();
    orderForm.classList.remove("was-validated");
    orderIdField.value = "";
    orderModalLabel.textContent = "Agregar Orden";
    orderModalSubmit.innerHTML = '<i class="bi bi-check-lg me-1"></i>Guardar';
    orderModal.show();
  });

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    orderForm.classList.add("was-validated");
    if (!orderForm.checkValidity()) return;

    const id = orderIdField.value;
    const email = orderEmail.value.trim();
    const items = orderItems.value.trim();
    const total = orderTotal.value;
    const status = orderStatus.value;
    const date = orderDate.value;

    let orders = getOrders();
    if (id) {
      orders = orders.map((o) =>
        o.id === id ? { id, email, items, total, status, date } : o
      );
    } else {
      orders.push({ id: generateId(), email, items, total, status, date });
    }
    saveOrders(orders);
    orderModal.hide();
    renderOrdersTable(searchOrder.value.trim(), filterStatus.value);
  });

  searchOrder.addEventListener("input", () => {
    renderOrdersTable(searchOrder.value.trim(), filterStatus.value);
  });
  filterStatus.addEventListener("change", () => {
    renderOrdersTable(searchOrder.value.trim(), filterStatus.value);
  });
  btnClear.addEventListener("click", () => {
    searchOrder.value = "";
    filterStatus.value = "";
    renderOrdersTable();
  });

  ordersTableBody.addEventListener("click", (e) => {
    if (e.target.closest(".btn-edit-order")) {
      const id = e.target.closest(".btn-edit-order").dataset.id;
      const orders = getOrders();
      const order = orders.find((o) => o.id === id);
      if (!order) return;
      orderIdField.value = order.id;
      orderEmail.value = order.email;
      orderItems.value = order.items;
      orderTotal.value = order.total;
      orderStatus.value = order.status;
      orderDate.value = order.date;
      orderModalLabel.textContent = "Editar Orden";
      orderModalSubmit.innerHTML =
        '<i class="bi bi-pencil-square me-1"></i>Actualizar';
      orderModal.show();
    }
    if (e.target.closest(".btn-delete-order")) {
      selectedDeleteOrderId = e.target.closest(".btn-delete-order").dataset.id;
      deleteOrderModal.show();
    }
  });

  deleteOrderConfirmBtn.addEventListener("click", () => {
    let orders = getOrders().filter((o) => o.id !== selectedDeleteOrderId);
    saveOrders(orders);
    deleteOrderModal.hide();
    renderOrdersTable(searchOrder.value.trim(), filterStatus.value);
  });
}

// SIDEBAR LOGIC
function initSidebarNavigation() {
  const navLinks = document.querySelectorAll('#sidebar .nav-link[id^="btn"]');
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      // Desactivar anteriores y activar el actual
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Contenedor principal donde inyectaremos el HTML
      const main = document.getElementById("mainContent");
      let url = "";

      switch (link.id) {
        case "btnUsers":
          url = "users.html";
          break;
        case "btnProducts":
          url = "products.html";
          break;
        case "btnOrders":
          url = "orders.html";
          break;
      }

      if (!url) return;

      try {
        const resp = await fetch(url);
        if (!resp.ok)
          throw new Error(`Error ${resp.status}: ${resp.statusText}`);
        const html = await resp.text();
        main.innerHTML = html;

        // Después de inyectar el HTML, inicializar el dashboard correspondiente:
        initUsersDashboard();
        initProductsDashboard();
        initOrdersDashboard();
      } catch (err) {
        console.error("No se pudo cargar la sección:", err);
        main.innerHTML =
          '<p class="text-danger">Hubo un error cargando el contenido.</p>';
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // detectar si hay un usuario logueado
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const dropdownMenuUser = document.getElementById("dropdownMenuUser");
  if (!dropdownMenuUser) return;

  if (currentUser) {
    // Si existe currentUser, reemplazo el contenido del dropdown
    dropdownMenuUser.innerHTML = `
      <li>
        <a class="dropdown-item" href="adminPanel.html">
          <i class="bi bi-speedometer2 me-1"></i> Panel de administrador
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" id="logoutBtn">
          <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
        </a>
      </li>
    `;

    // Agregar el listener al botón “Cerrar sesión”
    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      // opcional: recargar la página para que vuelva al estado “no logueado”
      window.location.reload();
    });
  } else {
    // Si NO hay currentUser, dejamos las opciones por defecto:
    // (registrarse / login). No hace falta modificar nada
    // porque el HTML ya las trae.
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtnSidebar = document.getElementById("logoutBtnSidebar");
  if (logoutBtnSidebar) {
    logoutBtnSidebar.addEventListener("click", (e) => {
      e.preventDefault();

      // Eliminar usuario del localStorage
      localStorage.removeItem("currentUser");

      // Mostrar toast
      const toastEl = document.getElementById("logoutToast");
      const bsToast = new bootstrap.Toast(toastEl);
      bsToast.show();

      // Redirigir después de un tiempo
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000); // 2 segundos para que se vea el toast
    });
  }
});

// DOCUMENT READY
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar navegación de sidebar
  initSidebarNavigation();

  // Si la página ya contiene sección de usuarios/productos/órdenes
  initUsersDashboard();
  initProductsDashboard();
  initOrdersDashboard();
});
