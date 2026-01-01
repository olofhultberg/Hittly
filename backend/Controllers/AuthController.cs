using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
    }

    // POST: api/Auth/register
    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return BadRequest(ModelState);
        }

        _logger.LogInformation("Användare {Email} registrerades.", model.Email);

        return Ok(new { message = "Användare registrerad framgångsrikt" });
    }

    // POST: api/Auth/login
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            return Unauthorized("Ogiltig e-post eller lösenord");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return Unauthorized("Kontot är låst. Försök igen senare.");
            }
            return Unauthorized("Ogiltig e-post eller lösenord");
        }

        _logger.LogInformation("Användare {Email} loggade in.", model.Email);

        return Ok(new { message = "Inloggning lyckades", userId = user.Id });
    }

    // POST: api/Auth/logout
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Utloggning lyckades" });
    }
}
