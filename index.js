    const API_BASE = "http://127.0.0.1:8000"; // jeśli inny host/port - zmień
    const endpoint = `${API_BASE}/ConcretePrediction`;

    const frm = document.getElementById("frm");
    const btnPredict = document.getElementById("btnPredict");

    const out = document.getElementById("out");
    const err = document.getElementById("err");

    const statusEl = document.getElementById("status");
    const ridEl = document.getElementById("rid");
    const mdlEl = document.getElementById("mdl");
    const predEl = document.getElementById("pred");

    function uuidLike() {
      return "req-" + Math.random().toString(16).slice(2, 10);
    }

    function num(id) {
      return Number(document.getElementById(id).value);
    }

    function showError(msg) {
      err.style.display = "block";
      err.textContent = msg;
    }

    function clearError() {
      err.style.display = "none";
      err.textContent = "";
    }

    function showResult(res) {
      out.style.display = "flex";
      out.classList.toggle("ok", res.status === "OK");
      out.classList.toggle("err", res.status !== "OK");

      statusEl.textContent = res.status ?? "—";
      ridEl.textContent = res.request_id ?? "—";
      mdlEl.textContent = res.model ?? "—";
      predEl.textContent = (res.prediction !== null && res.prediction !== undefined) ? res.prediction : "—";
    }

    document.getElementById("btnFill").addEventListener("click", () => {
      document.getElementById("request_id").value = uuidLike();
      document.getElementById("model").value = "concrete_strength_v1";

      document.getElementById("Cement").value = 540;
      document.getElementById("BlastFurnaceSlag").value = 0;
      document.getElementById("FlyAsh").value = 0;
      document.getElementById("Water").value = 162;
      document.getElementById("Superplasticizer").value = 2.5;
      document.getElementById("CoarseAggregate").value = 1040;
      document.getElementById("FineAggregate").value = 676;
      document.getElementById("Age").value = 28;
    });

    document.getElementById("btnClear").addEventListener("click", () => {
      frm.reset();
      out.style.display = "none";
      clearError();
    });

    frm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();

      // request_id auto jeśli puste
      const ridInput = document.getElementById("request_id");
      if (!ridInput.value.trim()) ridInput.value = uuidLike();

      const payload = {
        Cement: num("Cement"),
        BlastFurnaceSlag: num("BlastFurnaceSlag"),
        FlyAsh: num("FlyAsh"),
        Water: num("Water"),
        Superplasticizer: num("Superplasticizer"),
        CoarseAggregate: num("CoarseAggregate"),
        FineAggregate: num("FineAggregate"),
        Age: num("Age"),
      };

      const body = {
        request_id: ridInput.value.trim(),
        model: document.getElementById("model").value,
        payload
      };

      btnPredict.disabled = true;
      btnPredict.textContent = "Obliczanie...";

      try {
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const text = await resp.text();
        let data;
        try { data = JSON.parse(text); } catch { data = null; }

        if (!resp.ok) {
          const detail = data?.detail ? (typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)) : text;
          throw new Error(`HTTP ${resp.status}: ${detail}`);
        }

        showResult(data);
      } catch (ex) {
        showError(ex.message || String(ex));

        if (String(ex).includes("Failed to fetch")) {
          showError(
            "Nie udało się połączyć z API na " + endpoint 
          );
        }
      } finally {
        btnPredict.disabled = false;
        btnPredict.textContent = "Sprawdź";
      }
    });