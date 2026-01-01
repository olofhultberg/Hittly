using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpacesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SpacesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Spaces
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SpaceDto>>> GetSpaces()
    {
        var spaces = await _context.Spaces
            .OrderBy(s => s.Name)
            .Select(s => new SpaceDto
            {
                Id = s.Id,
                Name = s.Name,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return Ok(spaces);
    }

    // GET: api/Spaces/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SpaceDto>> GetSpace(int id)
    {
        var space = await _context.Spaces.FindAsync(id);

        if (space == null)
        {
            return NotFound();
        }

        return Ok(new SpaceDto
        {
            Id = space.Id,
            Name = space.Name,
            CreatedAt = space.CreatedAt,
            UpdatedAt = space.UpdatedAt
        });
    }

    // POST: api/Spaces
    [HttpPost]
    public async Task<ActionResult<SpaceDto>> CreateSpace(CreateSpaceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Namn är obligatoriskt");
        }

        if (dto.Name.Length > 100)
        {
            return BadRequest("Namn får inte vara längre än 100 tecken");
        }

        var space = new Space
        {
            Name = dto.Name.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Spaces.Add(space);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSpace), new { id = space.Id }, new SpaceDto
        {
            Id = space.Id,
            Name = space.Name,
            CreatedAt = space.CreatedAt,
            UpdatedAt = space.UpdatedAt
        });
    }

    // PUT: api/Spaces/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSpace(int id, UpdateSpaceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Namn är obligatoriskt");
        }

        if (dto.Name.Length > 100)
        {
            return BadRequest("Namn får inte vara längre än 100 tecken");
        }

        var space = await _context.Spaces.FindAsync(id);
        if (space == null)
        {
            return NotFound();
        }

        space.Name = dto.Name.Trim();
        space.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Spaces/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSpace(int id)
    {
        var space = await _context.Spaces
            .Include(s => s.Boxes)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (space == null)
        {
            return NotFound();
        }

        if (space.Boxes.Any())
        {
            return BadRequest("Kan inte ta bort utrymme med lådor");
        }

        _context.Spaces.Remove(space);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
