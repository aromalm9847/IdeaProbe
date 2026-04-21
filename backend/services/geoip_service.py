"""
GeoIP lookup via ip-api.com (free tier: 45 requests/min, no API key).
Gracefully returns empty dict on failure — geo data is best-effort.
"""
import logging
import httpx

logger = logging.getLogger(__name__)

_cache: dict[str, dict] = {}   # in-memory cache keyed by IP


async def lookup(ip: str | None) -> dict:
    """Return {country, country_code, region, city} or empty dict."""
    if not ip:
        return {}
    # Skip private / localhost ranges — ip-api returns fail for them
    if ip.startswith(("10.", "192.168.", "127.", "172.16.", "172.17.", "172.18.",
                      "172.19.", "172.20.", "172.21.", "172.22.", "172.23.",
                      "172.24.", "172.25.", "172.26.", "172.27.", "172.28.",
                      "172.29.", "172.30.", "172.31.", "100.64.")) or ip == "::1":
        return {}
    if ip in _cache:
        return _cache[ip]

    url = f"http://ip-api.com/json/{ip}?fields=status,country,countryCode,regionName,city"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
        data = resp.json()
        if data.get("status") != "success":
            _cache[ip] = {}
            return {}
        result = {
            "country": data.get("country") or "",
            "country_code": data.get("countryCode") or "",
            "region": data.get("regionName") or "",
            "city": data.get("city") or "",
        }
        _cache[ip] = result
        return result
    except Exception as e:
        logger.warning(f"GeoIP lookup failed for {ip}: {e}")
        return {}


def client_ip(request) -> str | None:
    """Extract client IP from FastAPI Request, honouring proxy headers."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else None
