const WHATSAPP_NUMBER = "5511910493041"; // Troque pelo número real com DDI + DDD + número

const fallbackProducts = [
  {
    id: 1,
    nome: "Kit Skincare Tiara Nuvem",
    preco: "Consulte no WhatsApp",
    descricao: "Kit com 6 peças para rotina de beleza, conforto e autocuidado.",
    imagem: "images/kit-skincare-tiara-nuvem.jpeg"
  },
  {
    id: 2,
    nome: "Kit Presente Giovanna Baby",
    preco: "Consulte no WhatsApp",
    descricao: "Kit de presente com produtos delicados para cuidados diários.",
    imagem: "images/kit-giovanna-baby.jpeg"
  },
  {
    id: 3,
    nome: "Kit Presente Spa Mini",
    preco: "Consulte no WhatsApp",
    descricao: "Kit com itens de bem-estar, relaxamento e cuidado pessoal.",
    imagem: "images/kit-presente-spa-mini.jpeg"
  },
  {
    id: 4,
    nome: "Linha Nelô Doce de Leite",
    preco: "Consulte no WhatsApp",
    descricao: "Linha corporal com hidratação, esfoliante e sabonete.",
    imagem: "images/kit-doce-de-leite.jpeg"
  },
  {
    id: 5,
    nome: "Kit Rosa Mosqueta",
    preco: "Consulte no WhatsApp",
    descricao: "Kit de cuidados com foco em hidratação, luminosidade e maciez.",
    imagem: "images/kit-rosa-mosqueta.jpeg"
  },
  {
    id: 6,
    nome: "Kit Feminino Luxo",
    preco: "Consulte no WhatsApp",
    descricao: "Kit sofisticado com acessórios para presentear com elegância.",
    imagem: "images/kit-elegancia.jpeg"
  },
  {
    id: 7,
    nome: "Kit Puro Leite",
    preco: "Consulte no WhatsApp",
    descricao: "Kit completo para cuidados diários com toque suave e hidratante.",
    imagem: "images/kit-puro-leite.jpeg"
  },
  {
    id: 40,
    nome: "Kit Presente Linda Garota",
    preco: "Consulte no WhatsApp",
    descricao: "Kit presente com perfume, body splash e bolsa.",
    imagem: "images/kit-presente-linda-garota.png"
  }
];

const categoryGroups = {
  "Produtos de beleza": new Set([12, 13, 18, 19, 23, 27, 31, 34, 36, 38]),
  "Kits para presentes": new Set([1, 2, 4, 8, 9, 11, 25, 28, 29, 33, 37, 40]),
  "Perfumes": new Set([5, 17, 20, 21, 24, 39, 41]),
  "Acessórios": new Set([3, 6, 7, 10, 14, 15, 16, 22, 26, 30, 32, 35])
};

function getProductCategory(product) {
  if (product.categoria) {
    return product.categoria;
  }

  return Object.entries(categoryGroups).find(([, ids]) => ids.has(product.id))?.[0] || "Kits para presentes";
}

const whatsappLinks = document.querySelectorAll("#whatsappTop, #whatsappBottom");
const categoryFilters = document.querySelectorAll(".category-filter");
let catalogProducts = [];
let activeCategory = "Todos";

function formatPrice(value) {
  if (typeof value === "string") {
    return value;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function buildWhatsAppUrl(productName = "") {
  const message = productName
    ? `Olá! Tenho interesse no produto: ${productName}`
    : "Olá! Quero informações sobre os produtos do catálogo.";

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function setWhatsappLinks() {
  whatsappLinks.forEach((link) => {
    link.href = buildWhatsAppUrl();
  });
}

function renderProducts(products) {
  const track = document.getElementById("productTrack");

  track.innerHTML = products.map((product) => `
    <article class="card">
      <div class="card__image" data-full-image="${product.imagem}" data-product-name="${product.nome}">
        <img src="${product.imagem}" alt="${product.nome}" onerror="this.style.display='none'" />
      </div>
      <div class="card__body">
        <span class="card__category">${getProductCategory(product)}</span>
        <div class="card__title">${product.nome}</div>
        <div class="price">${formatPrice(product.preco)}</div>
        <p class="description">${product.descricao}</p>
        <div class="card__actions">
          <a class="whatsapp-btn" href="${buildWhatsAppUrl(product.nome)}" target="_blank" rel="noopener">
            Comprar
          </a>
        </div>
      </div>
    </article>
  `).join("");
}

function renderActiveCategory() {
  const visibleProducts = activeCategory === "Todos"
    ? catalogProducts
    : catalogProducts.filter((product) => getProductCategory(product) === activeCategory);

  renderProducts(visibleProducts);

  const track = document.getElementById("productTrack");
  if (track) {
    track.scrollTo({ left: 0, behavior: "auto" });
  }
}

function setupCategoryFilters() {
  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      activeCategory = filter.dataset.category || "Todos";
      categoryFilters.forEach((item) => {
        const isActive = item === filter;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      renderActiveCategory();
    });
  });
}

function setupProductCarousel() {
  const track = document.getElementById("productTrack");
  const prevButton = document.getElementById("productPrev");
  const nextButton = document.getElementById("productNext");

  if (!track || !prevButton || !nextButton) {
    return;
  }

  const scrollByCard = (direction) => {
    const card = track.querySelector(".card");
    if (!card) {
      return;
    }

    const cardWidth = card.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;
    track.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
  };

  prevButton.addEventListener("click", () => scrollByCard(-1));
  nextButton.addEventListener("click", () => scrollByCard(1));
}

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeButton = document.getElementById("lightboxClose");
  const track = document.getElementById("productTrack");

  if (!lightbox || !lightboxImage || !closeButton || !track) {
    return;
  }

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
  };

  track.addEventListener("click", (event) => {
    const imageCard = event.target.closest(".card__image");
    if (!imageCard) {
      return;
    }

    const imageSrc = imageCard.dataset.fullImage;
    const productName = imageCard.dataset.productName || "Imagem do produto";

    if (!imageSrc) {
      return;
    }

    lightboxImage.src = imageSrc;
    lightboxImage.alt = productName;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}

async function loadProducts() {
  try {
    const response = await fetch("data/produtos.json");
    if (!response.ok) {
      throw new Error("Falha ao carregar o JSON");
    }

    catalogProducts = await response.json();
    renderActiveCategory();
  } catch (error) {
    catalogProducts = fallbackProducts;
    renderActiveCategory();
  }
}

setWhatsappLinks();
setupCategoryFilters();
loadProducts();
setupProductCarousel();
setupLightbox();
