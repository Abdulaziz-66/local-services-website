/* =========================================================
   خدماتنا — جودة وتميز
   سلوك الموقع: القائمة، التمرير، الفلاتر، النافذة، والفيديو
   ========================================================= */

(() => {
  "use strict";

  const doc = document;
  const body = doc.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const whatsappNumber = "966551234567";

  /* ---------- 1) الهيدر وشريط التقدم ---------- */
  const header = doc.getElementById("siteHeader");
  const progressBar = doc.getElementById("scrollProgress");
  const backToTop = doc.getElementById("backToTop");

  let scrollTicking = false;

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || doc.documentElement.scrollTop;
    const scrollHeight = doc.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;

    header?.classList.toggle("is-scrolled", scrollTop > 12);

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress})`;
    }

    setActiveNavLink(scrollTop);
    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollUI);
    }
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  });

  /* ---------- 2) قائمة الجوال ---------- */
  const menuToggle = doc.querySelector(".menu-toggle");
  const primaryNav = doc.getElementById("primaryNav");
  const navBackdrop = doc.getElementById("navBackdrop");
  const navLinks = primaryNav ? [...primaryNav.querySelectorAll("a")] : [];

  const openNav = () => {
    body.classList.add("nav-open");
    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "إغلاق قائمة التنقل");
    navBackdrop?.setAttribute("aria-hidden", "false");
  };

  const closeNav = () => {
    body.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "فتح قائمة التنقل");
    navBackdrop?.setAttribute("aria-hidden", "true");
  };

  menuToggle?.addEventListener("click", () => {
    if (body.classList.contains("nav-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  navBackdrop?.addEventListener("click", closeNav);

  navLinks.forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      closeNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      closeNav();
    }
  });

  /* ---------- 3) تفعيل رابط القسم الحالي ---------- */
  const sectionLinks = primaryNav
    ? [...primaryNav.querySelectorAll(".nav-link")]
    : [];

  const navSections = sectionLinks
    .map((link) => {
      const target = link.getAttribute("href");
      return target ? doc.querySelector(target) : null;
    })
    .filter(Boolean);

  function setActiveNavLink(scrollTop) {
    if (!navSections.length) return;

    const offset = (header?.offsetHeight || 0) + 90;
    let currentId = navSections[0].id;

    navSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        currentId = section.id;
      }
    });

    const pageBottom =
      window.innerHeight + scrollTop >= doc.documentElement.scrollHeight - 6;

    if (pageBottom) {
      currentId = navSections[navSections.length - 1].id;
    }

    sectionLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ---------- 4) ظهور العناصر عند التمرير ---------- */
  const revealElements = [...doc.querySelectorAll(".reveal")];

  if (revealElements.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      revealElements.forEach((element) => revealObserver.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    }
  }

  /* ---------- 5) عدادات الإحصائيات ---------- */
  const counters = [...doc.querySelectorAll("[data-count]")];

  const setCounterValue = (element, value) => {
    const target = Number(element.dataset.count) || 0;
    const prefix = element.dataset.prefix || "";
    const suffix = element.dataset.suffix || "";
    element.textContent = `${prefix}${value.toLocaleString("en-US")}${suffix}`;

    if (value >= target) {
      element.dataset.done = "true";
    }
  };

  const animateCounter = (element) => {
    if (element.dataset.done === "true") return;

    const target = Number(element.dataset.count) || 0;

    if (reduceMotion) {
      setCounterValue(element, target);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);

      setCounterValue(element, value);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  };

  const statsSection = doc.getElementById("statsGrid");

  if (counters.length) {
    if (statsSection && "IntersectionObserver" in window) {
      const statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            counters.forEach(animateCounter);
            observer.disconnect();
          });
        },
        { threshold: 0.3 }
      );

      statsObserver.observe(statsSection);
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------- 6) أسئلة شائعة ---------- */
  const faqItems = [...doc.querySelectorAll(".faq-item")];

  const setFaqState = (item, isOpen) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    item.classList.toggle("is-open", isOpen);
    question?.setAttribute("aria-expanded", String(isOpen));
    answer?.setAttribute("aria-hidden", String(!isOpen));
  };

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    setFaqState(item, item.classList.contains("is-open"));

    question.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      faqItems.forEach((otherItem) => setFaqState(otherItem, false));

      if (willOpen) {
        setFaqState(item, true);
      }
    });
  });

  /* ---------- 7) تصفية المنتجات ---------- */
  const filterButtons = [...doc.querySelectorAll(".filter-btn")];
  const productCards = [...doc.querySelectorAll(".product-card[data-category]")];

  const applyProductFilter = (filter) => {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    productCards.forEach((card) => {
      const shouldShow =
        filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyProductFilter(button.dataset.filter || "all");
    });
  });

  /* ---------- 8) نافذة تفاصيل المنتج ---------- */
  const modal = doc.getElementById("productModal");
  const modalImage = doc.getElementById("modalProductImage");
  const modalCategory = doc.getElementById("modalProductCategory");
  const modalTitle = doc.getElementById("productModalTitle");
  const modalDescription = doc.getElementById("modalProductDesc");
  const modalFeatures = doc.getElementById("modalProductFeatures");
  const modalPrice = doc.getElementById("modalProductPrice");
  const modalCta = doc.getElementById("modalProductCta");
  const modalCloseButton = modal?.querySelector("[data-close-modal]");

  let lastFocusedElement = null;

  const products = {
    rawaq: {
      title: "قالب متجر «رواق»",
      category: "قالب جاهز",
      price: "349 ر.س",
      description:
        "قالب عربي متجاوب مبني بعناية لمتاجر المنتجات المنزلية والإكسسوارات. سريع، سهل التخصيص، وجاهز للربط مع بوابات الدفع المحلية.",
      image:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1000&h=900&q=85",
      alt: "قالب متجر رواق الإلكتروني",
      features: [
        "6 صفحات جاهزة: الرئيسية، المتجر، المنتج، السلة، الدفع، ومن نحن",
        "متوافق بالكامل مع الجوال والتابلت",
        "ملفات HTML وCSS وJavaScript قابلة للتعديل",
        "دليل تركيب عربي + دعم فني لمدة 14 يوماً",
      ],
      message: "مرحباً، أرغب بطلب قالب متجر «رواق» بسعر 349 ر.س.",
    },
    basma: {
      title: "حزمة هوية «بصمة»",
      category: "هوية بصرية",
      price: "599 ر.س",
      description:
        "هوية بصرية متكاملة تمنح علامتك حضوراً واضحاً ومتسقاً، من الشعار حتى تطبيقات السوشيال ميديا والطباعة.",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&h=900&q=85",
      alt: "حزمة هوية بصرية بصمة",
      features: [
        "3 مقترحات لتصميم الشعار مع تعديلين مجانيين",
        "دليل هوية يشمل الألوان والخطوط وقواعد الاستخدام",
        "10 قوالب سوشيال ميديا جاهزة",
        "ملفات مفتوحة بصيغ AI وPDF وPNG",
      ],
      message: "مرحباً، أرغب بطلب حزمة هوية «بصمة» بسعر 599 ر.س.",
    },
    malaf: {
      title: "قالب موقع «ملف»",
      category: "قالب جاهز",
      price: "199 ر.س",
      description:
        "قالب أنيق للمستقلين وأصحاب المهن لعرض الخبرات والأعمال، مع صفحة تواصل ونموذج جاهز للاستخدام.",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&h=900&q=85",
      alt: "قالب موقع ملف الشخصي",
      features: [
        "صفحة رئيسية + صفحة أعمال + صفحة تواصل",
        "تصميم متجاوب وسريع التحميل",
        "نموذج تواصل جاهز للربط",
        "دليل تخصيص مبسط باللغة العربية",
      ],
      message: "مرحباً، أرغب بطلب قالب موقع «ملف» بسعر 199 ر.س.",
    },
    tamanina: {
      title: "حزمة دعم «طمأنينة»",
      category: "حزمة دعم",
      price: "899 ر.س / سنة",
      description:
        "حزمة سنوية تحافظ على جاهزية أجهزتك وبياناتك، وتضمن لك أولوية استجابة عند أي عطل طارئ.",
      image:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1000&h=900&q=85",
      alt: "حزمة دعم طمأنينة للصيانة الدورية",
      features: [
        "12 زيارة صيانة وقائية موزعة على العام",
        "أولوية استجابة خلال 30 دقيقة في أوقات العمل",
        "نسخ احتياطي شهري آمن للبيانات",
        "تقرير مبسط بحالة الأجهزة بعد كل زيارة",
      ],
      message: "مرحباً، أرغب بطلب حزمة دعم «طمأنينة» بسعر 899 ر.س سنوياً.",
    },
    social: {
      title: "تصاميم سوشيال ميديا",
      category: "هوية بصرية",
      price: "299 ر.س",
      description:
        "حزمة بصرية متناسقة لشهر كامل، تساعد علامتك على الظهور باحترافية وثبات على مختلف المنصات.",
      image:
        "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=1000&h=900&q=85",
      alt: "تصاميم سوشيال ميديا متناسقة",
      features: [
        "10 تصاميم إبداعية قابلة للتعديل",
        "مقاسات جاهزة لإنستغرام وإكس ولينكدإن",
        "كتابة نصوص قصيرة مناسبة لكل تصميم",
        "ملفات PNG وJPG عالية الجودة",
      ],
      message: "مرحباً، أرغب بطلب حزمة تصاميم سوشيال ميديا (10 تصاميم) بسعر 299 ر.س.",
    },
    security: {
      title: "دليل حماية بياناتك",
      category: "منتج رقمي",
      price: "79 ر.س",
      description:
        "دليل عملي بصيغة PDF يشرح خطوات حماية الحسابات والأجهزة من الاختراق والاحتيال، بلغة بسيطة ودون تعقيد.",
      image:
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1000&h=900&q=85",
      alt: "دليل حماية البيانات الرقمية",
      features: [
        "42 صفحة من الخطوات العملية والقوائم الجاهزة",
        "شرح المصادقة الثنائية وإدارة كلمات المرور",
        "خطة استجابة سريعة عند الاشتباه باختراق",
        "تحديثات مجانية للدليل لمدة سنة",
      ],
      message: "مرحباً، أرغب بطلب دليل حماية بياناتك الرقمية بسعر 79 ر.س.",
    },
  };

  const closeProductModal = () => {
    if (!modal) return;

    if (typeof modal.close === "function") {
      modal.close();
    } else {
      modal.removeAttribute("open");
      body.classList.remove("modal-open");
      lastFocusedElement?.focus();
    }
  };

  const openProductModal = (productId, trigger) => {
    const product = products[productId];
    if (!product || !modal) return;

    lastFocusedElement = trigger;

    if (modalTitle) modalTitle.textContent = product.title;
    if (modalCategory) modalCategory.textContent = product.category;
    if (modalDescription) modalDescription.textContent = product.description;
    if (modalPrice) modalPrice.textContent = product.price;

    if (modalImage) {
      modalImage.src = product.image;
      modalImage.alt = product.alt;
    }

    if (modalFeatures) {
      modalFeatures.replaceChildren();

      product.features.forEach((feature) => {
        const item = doc.createElement("li");
        item.innerHTML =
          '<svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg><span></span>';
        item.querySelector("span").textContent = feature;
        modalFeatures.appendChild(item);
      });
    }

    if (modalCta) {
      modalCta.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        product.message
      )}`;
    }

    body.classList.add("modal-open");

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
  };

  doc.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => {
      openProductModal(button.dataset.product, button);
    });
  });

  modalCloseButton?.addEventListener("click", closeProductModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeProductModal();
    }
  });

  modal?.addEventListener("close", () => {
    body.classList.remove("modal-open");
    lastFocusedElement?.focus();
  });

  /* ---------- 9) تحويل أزرار الطلب إلى واتساب ---------- */
  doc.querySelectorAll(".order-btn[data-service]").forEach((button) => {
    const service = button.dataset.service;

    if (!service) return;

    button.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `مرحباً، أرغب بطلب خدمة ${service}. هل يمكنكم إرسال عرض سعر وتفاصيل التنفيذ؟`
    )}`;
  });

  /* ---------- 10) الفيديوهات ---------- */
  doc.querySelectorAll(".video-frame[data-video-id]").forEach((frame) => {
    const playButton = frame.querySelector(".video-play");

    const playVideo = () => {
      if (frame.classList.contains("is-playing")) return;

      const videoId = frame.dataset.videoId;
      if (!videoId) return;

      const params = new URLSearchParams({
        autoplay: "1",
        rel: "0",
        modestbranding: "1",
        playsinline: "1",
      });

      if (frame.dataset.videoStart) {
        params.set("start", frame.dataset.videoStart);
      }

      if (frame.dataset.videoEnd) {
        params.set("end", frame.dataset.videoEnd);
      }

      const iframe = doc.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        videoId
      )}?${params.toString()}`;
      iframe.title = frame.dataset.videoTitle || "فيديو توضيحي";
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;

      frame.replaceChildren(iframe);
      frame.classList.add("is-playing");
    };

    frame.addEventListener("click", (event) => {
      if (event.target.closest("iframe")) return;
      playVideo();
    });

    playButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      playVideo();
    });
  });

  /* ---------- 11) نموذج التواصل ---------- */
  const contactForm = doc.getElementById("contactForm");
  const formStatus = doc.getElementById("formStatus");

  if (contactForm) {
    const fields = {
      name: doc.getElementById("name"),
      email: doc.getElementById("email"),
      message: doc.getElementById("message"),
    };

    const setFieldError = (field, message) => {
      const group = field.closest(".form-group");
      const error = doc.getElementById(`${field.id}Error`);

      group?.classList.add("has-error");
      field.setAttribute("aria-invalid", "true");
      if (error) error.textContent = message;
    };

    const clearFieldError = (field) => {
      const group = field.closest(".form-group");
      const error = doc.getElementById(`${field.id}Error`);

      group?.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
      if (error) error.textContent = "";

      if (formStatus) {
        formStatus.className = "form-status";
        formStatus.textContent = "";
      }
    };

    Object.values(fields).forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => clearFieldError(field));
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      Object.values(fields).forEach((field) => {
        if (field) clearFieldError(field);
      });

      let firstInvalid = null;

      const name = fields.name?.value.trim() || "";
      const email = fields.email?.value.trim() || "";
      const message = fields.message?.value.trim() || "";
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (name.length < 2) {
        setFieldError(fields.name, "يرجى كتابة الاسم الكامل (حرفان على الأقل).");
        firstInvalid = firstInvalid || fields.name;
      }

      if (!emailPattern.test(email)) {
        setFieldError(fields.email, "يرجى إدخال بريد إلكتروني صحيح.");
        firstInvalid = firstInvalid || fields.email;
      }

      if (message.length < 10) {
        setFieldError(fields.message, "يرجى كتابة رسالة من 10 أحرف على الأقل.");
        firstInvalid = firstInvalid || fields.message;
      }

      if (firstInvalid) {
        if (formStatus) {
          formStatus.className = "form-status is-error";
          formStatus.textContent = "يرجى تصحيح الحقول المطلوبة قبل الإرسال.";
        }
        firstInvalid.focus();
        return;
      }

      const subject = `رسالة جديدة من موقع خدماتنا — ${name}`;
      const mailBody = [
        `الاسم: ${name}`,
        `البريد الإلكتروني: ${email}`,
        "",
        "الرسالة:",
        message,
      ].join("\n");

      window.location.href = `mailto:info@khadamatuna.sa?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(mailBody)}`;

      if (formStatus) {
        formStatus.className = "form-status is-success";
        formStatus.textContent =
          "تم تجهيز رسالتك في تطبيق البريد الإلكتروني. إذا لم يفتح التطبيق تلقائياً، راسلنا مباشرة على info@khadamatuna.sa.";
      }

      contactForm.reset();
    });
  }

  updateScrollUI();
})();
