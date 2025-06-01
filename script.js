class IPTrackerPro {
  constructor() {
    this.stats = {
      totalTracked: 6382,
      responseTimes: [],
      successCount: 0,
    };
    this.initializeElements();
    this.bindEvents();
    this.loadStats();
  }

  initializeElements() {
    this.form = document.getElementById("searchForm");
    this.ipInput = document.getElementById("ipInput");
    this.trackBtn = document.getElementById("trackBtn");
    this.myIpBtn = document.getElementById("myIpBtn");
    this.loadingSection = document.getElementById("loadingSection");
    this.errorSection = document.getElementById("errorSection");
    this.resultContainer = document.getElementById("resultContainer");
  }

  bindEvents() {
    this.form.addEventListener("submit", (e) => this.handleTrack(e));
    this.myIpBtn.addEventListener("click", () => this.trackMyIP());

    // Auto-clear error on input
    this.ipInput.addEventListener("input", () => this.hideError());
  }

  async handleTrack(e) {
    e.preventDefault();
    const ip = this.ipInput.value.trim();

    if (!ip) {
      this.showError("Please enter an IP address to track");
      return;
    }

    if (!this.isValidIP(ip)) {
      this.showError(
        "Invalid IP address format. Please enter a valid IPv4 or IPv6 address."
      );
      return;
    }

    await this.performTrack(ip);
  }

  async trackMyIP() {
    await this.performTrack();
  }

  async performTrack(ip = "") {
    const startTime = Date.now();
    this.showLoading(true);
    this.hideError();
    this.hideResults();

    try {
      const url = ip
        ? `https://ipapi.co/${ip}/json/`
        : "https://ipapi.co/json/";
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.reason || "API returned an error");
      }

      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime, true);
      this.displayResults(data);

      // Update input if tracking current IP
      if (!ip) {
        this.ipInput.value = data.ip || "";
      }
    } catch (error) {
      console.error("Tracking error:", error);
      this.updateStats(Date.now() - startTime, false);
      this.showError(`Failed to track IP: ${error.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  displayResults(data) {
    // Header information
    document.getElementById("ipDisplay").textContent = data.ip || "Unknown";
    document.getElementById("ipType").textContent = data.version || "Unknown";

    // Location data
    document.getElementById("country").innerHTML = `
                    ${data.country_name || "N/A"} (${
      data.country_code || "N/A"
    })
                    ${
                      data.country_code
                        ? `<img class="flag-img" src="https://flagcdn.com/w40/${data.country_code.toLowerCase()}.png" alt="${
                            data.country_name
                          } flag">`
                        : ""
                    }
                `;
    document.getElementById("region").textContent = `${data.region || "N/A"} (${
      data.region_code || "N/A"
    })`;
    document.getElementById("city").textContent = data.city || "N/A";
    document.getElementById("postal").textContent = data.postal || "N/A";
    document.getElementById("coordinates").textContent =
      data.latitude && data.longitude
        ? `${data.latitude}, ${data.longitude}`
        : "N/A";

    // Network information
    document.getElementById("isp").textContent = data.org || "N/A";
    document.getElementById("asn").textContent = data.asn || "N/A";
    document.getElementById("hostname").textContent = data.hostname || "N/A";
    document.getElementById("timezone").textContent = data.timezone || "N/A";
    document.getElementById("utcOffset").textContent = data.utc_offset || "N/A";

    // Regional data
    document.getElementById("capital").textContent =
      data.country_capital || "N/A";
    document.getElementById("currency").textContent = `${
      data.currency_name || "N/A"
    } (${data.currency || "N/A"})`;
    document.getElementById("languages").textContent = data.languages || "N/A";
    document.getElementById("callingCode").textContent =
      data.country_calling_code || "N/A";
    document.getElementById("euMember").innerHTML = data.in_eu
      ? '<span class="status-badge badge-success">Yes</span>'
      : '<span class="status-badge badge-info">No</span>';

    // Map coordinates
    document.getElementById("mapCoordinates").textContent =
      data.latitude && data.longitude
        ? `${data.latitude}, ${data.longitude}`
        : "Coordinates unavailable";

    this.showResults();
  }

  updateStats(responseTime, success) {
    this.stats.totalTracked++;
    this.stats.responseTimes.push(responseTime);
    if (success) this.stats.successCount++;

    // Update UI
    document.getElementById("totalTracked").textContent =
      this.stats.totalTracked;

    const avgTime =
      this.stats.responseTimes.reduce((a, b) => a + b, 0) /
      this.stats.responseTimes.length;
    document.getElementById("avgResponseTime").textContent =
      Math.round(avgTime);

    const successRate = Math.round(
      (this.stats.successCount / this.stats.totalTracked) * 100
    );
    document.getElementById("successRate").textContent = successRate;

    // Save stats to memory
    this.saveStats();
  }

  isValidIP(ip) {
    // IPv4 regex pattern
    const ipv4Pattern =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 regex pattern (simplified)
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

    // More comprehensive IPv6 pattern
    const ipv6ComprehensivePattern =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return (
      ipv4Pattern.test(ip) ||
      ipv6Pattern.test(ip) ||
      ipv6ComprehensivePattern.test(ip)
    );
  }

  showLoading(show) {
    this.loadingSection.style.display = show ? "block" : "none";
    this.trackBtn.disabled = show;
    this.myIpBtn.disabled = show;

    if (show) {
      this.trackBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Tracking...';
    } else {
      this.trackBtn.innerHTML = '<i class="fas fa-search"></i> Track Location';
    }
  }

  showResults() {
    this.resultContainer.style.display = "block";
    this.resultContainer.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  hideResults() {
    this.resultContainer.style.display = "none";
  }

  showError(message) {
    this.errorSection.textContent = message;
    this.errorSection.style.display = "block";
    this.errorSection.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  hideError() {
    this.errorSection.style.display = "none";
  }

  saveStats() {
    // Save stats to a simple variable since localStorage is not available
    window.ipTrackerStats = this.stats;
  }

  loadStats() {
    // Load stats from memory if available
    if (window.ipTrackerStats) {
      this.stats = { ...window.ipTrackerStats };
      this.updateStatsDisplay();
    }
  }

  updateStatsDisplay() {
    document.getElementById("totalTracked").textContent =
      this.stats.totalTracked;

    if (this.stats.responseTimes.length > 0) {
      const avgTime =
        this.stats.responseTimes.reduce((a, b) => a + b, 0) /
        this.stats.responseTimes.length;
      document.getElementById("avgResponseTime").textContent =
        Math.round(avgTime);
    }

    if (this.stats.totalTracked > 0) {
      const successRate = Math.round(
        (this.stats.successCount / this.stats.totalTracked) * 100
      );
      document.getElementById("successRate").textContent = successRate;
    }
  }
}

// Initialize the IP Tracker when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new IPTrackerPro();
});

// Add some keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to track IP
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    document.getElementById("searchForm").dispatchEvent(new Event("submit"));
  }

  // Ctrl/Cmd + M to track my IP
  if ((e.ctrlKey || e.metaKey) && e.key === "m") {
    e.preventDefault();
    document.getElementById("myIpBtn").click();
  }
});

// Add a simple easter egg
let clickCount = 0;
document.querySelector(".logo-icon").addEventListener("click", () => {
  clickCount++;
  if (clickCount === 5) {
    document.querySelector(".logo-icon").style.animation =
      "spin 2s linear infinite";
    setTimeout(() => {
      document.querySelector(".logo-icon").style.animation = "";
      clickCount = 0;
    }, 2000);
  }
});
