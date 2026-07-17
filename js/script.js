const WHATSAPP_NUMBER = "5511924953207"; // Troque pelo número real com DDI + DDD + número

const fallbackProducts = [
  {
    id: 1,
    nome: "Kit Skincare Tiara Nuvem",
    preco: "Consulte no WhatsApp",
    descricao: "Kit com 6 peças para rotina de beleza, conforto e autocuidado.",
    imagem: "images/kit-skincare-tiara-nuvem.png"
  },
  {
    id: 2,
    nome: "Kit Presente Giovanna Baby",
    preco: "Consulte no WhatsApp",
    descricao: "Kit de presente com produtos delicados para cuidados diários.",
    imagem: "images/kit-presente-giovanna-baby.png"
  },
  {
    id: 3,
    nome: "Kit Presente Spa Mini",
    preco: "Consulte no WhatsApp",
    descricao: "Kit com itens de bem-estar, relaxamento e cuidado pessoal.",
    imagem: "images/kit-presente-spa-mini.png"
  },
  {
    id: 4,
    nome: "Linha Nelô Doce de Leite",
    preco: "Consulte no WhatsApp",
    descricao: "Linha corporal com hidratação, esfoliante e sabonete.",
    imagem: "images/linha-doce-de-leite.png"
  },
  {
    id: 5,
    nome: "Kit Rosa Mosqueta",
    preco: "Consulte no WhatsApp",
    descricao: "Kit de cuidados com foco em hidratação, luminosidade e maciez.",
    imagem: "images/kit-rosa-mosqueta.png"
  },
  {
    id: 6,
    nome: "Kit Feminino Luxo",
    preco: "Consulte no WhatsApp",
    descricao: "Kit sofisticado com acessórios para presentear com elegância.",
    imagem: "images/kit-feminino-luxo.png"
  },
  {
    id: 7,
    nome: "Kit Puro Leite",
    preco: "Consulte no WhatsApp",
    descricao: "Kit completo para cuidados diários com toque suave e hidratante.",
    imagem: "images/kit-puro-leite.png"
  }
];

const whatsappLinks = document.querySelectorAll("#whatsappTop, #whatsappBottom");

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

    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    renderProducts(fallbackProducts);
  }
}

setWhatsappLinks();
loadProducts();
setupProductCarousel();
setupLightbox();
