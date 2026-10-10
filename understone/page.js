fetch("/understone/content.json")
  .then(response => {
    if (!response.ok) throw Error("Content unavailable");
    return response.json();
  })
  .then(content => {
    const page = document.body.dataset.page;
    const select = document.querySelector("select");
    const wanted = new URLSearchParams(location.search).get("lang");
    const supported = ["en", "zh-Hans", "zh-Hant"];
    const deviceLanguage = navigator.language || "en";
    let language = supported.includes(wanted) ? wanted
      : deviceLanguage.toLowerCase().startsWith("zh")
        ? (/hant|tw|hk|mo/i.test(deviceLanguage) ? "zh-Hant" : "zh-Hans")
        : "en";

    function show() {
      const current = content[language];
      document.documentElement.lang = language;
      document.title = "Understone · " + current[page];
      document.querySelector("h1").textContent = current[page];
      document.querySelector("small").textContent = current.updated;
      document.querySelector("label span").textContent = current.language;
      document.querySelector("#sections").replaceChildren(
        ...current.sections[page].map(([title, text]) => {
          const section = document.createElement("section");
          const heading = document.createElement("h2");
          const paragraph = document.createElement("p");
          heading.textContent = title;
          paragraph.textContent = text;
          section.append(heading, paragraph);
          return section;
        })
      );
      document.querySelector("#operator").textContent = current.operator + " ";
      for (const kind of ["support", "privacy"]) {
        const link = document.querySelector("nav [data-kind=" + kind + "]");
        link.textContent = current[kind];
        link.href = "/understone/" + kind + "/?lang=" + language;
      }
      select.value = language;
    }

    select.addEventListener("change", () => {
      language = select.value;
      const url = new URL(location.href);
      url.searchParams.set("lang", language);
      history.replaceState(null, "", url);
      show();
    });
    show();
  })
  .catch(() => {
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.textContent = "Additional languages are unavailable. The English page remains available.";
    document.querySelector("header").append(status);
  });
