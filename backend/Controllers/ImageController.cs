using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ImageController> _logger;

    public ImageController(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ImageController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    // POST: api/Image/remove-background
    [HttpPost("remove-background")]
    public async Task<IActionResult> RemoveBackground(IFormFile image)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest("Ingen bild skickades");
        }

        var apiKey = _configuration["RemoveBg:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Remove.bg API-nyckel saknas i konfiguration");
            return StatusCode(500, "Bakgrundsborttagning är inte konfigurerad");
        }

        try
        {
            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Api-Key", apiKey);
            client.Timeout = TimeSpan.FromSeconds(30);

            using var form = new MultipartFormDataContent();
            using var imageStream = image.OpenReadStream();
            var imageContent = new StreamContent(imageStream);
            imageContent.Headers.ContentType = MediaTypeHeaderValue.Parse(image.ContentType);
            form.Add(imageContent, "image_file", image.FileName);

            // Lägg till inställningar för bättre resultat
            form.Add(new StringContent("auto"), "size");
            form.Add(new StringContent("true"), "crop");

            var response = await client.PostAsync("https://api.remove.bg/v1.0/removebg", form);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Remove.bg API fel: {StatusCode} - {Error}", response.StatusCode, errorContent);
                
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    return StatusCode(500, "Ogiltig API-nyckel för bakgrundsborttagning");
                }
                
                return StatusCode((int)response.StatusCode, $"Fel vid bakgrundsborttagning: {errorContent}");
            }

            var resultImage = await response.Content.ReadAsByteArrayAsync();
            // Returnera som base64 för enklare hantering i mobilappen
            var base64String = Convert.ToBase64String(resultImage);
            return Ok(new { image = base64String, format = "png" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fel vid bakgrundsborttagning");
            return StatusCode(500, $"Ett fel uppstod: {ex.Message}");
        }
    }
}


