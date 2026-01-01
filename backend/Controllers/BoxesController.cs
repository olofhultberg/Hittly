using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoxesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BoxesController> _logger;

    public BoxesController(ApplicationDbContext context, ILogger<BoxesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Boxes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BoxDto>>> GetBoxes()
    {
        var boxes = await _context.Boxes
            .Include(b => b.BoxImages.OrderByDescending(img => img.CreatedAt).Take(1))
            .OrderBy(b => b.Name)
            .Select(b => new BoxDto
            {
                Id = b.Id,
                Name = b.Name,
                SpaceId = b.SpaceId,
                ZoneId = b.ZoneId,
                LabelCode = b.LabelCode,
                ImageUri = b.BoxImages.FirstOrDefault() != null ? b.BoxImages.First().Uri : null,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            })
            .ToListAsync();

        return Ok(boxes);
    }

    // GET: api/Boxes/5
    [HttpGet("{id}")]
    public async Task<ActionResult<BoxDto>> GetBox(int id)
    {
        var box = await _context.Boxes
            .Include(b => b.BoxImages.OrderByDescending(img => img.CreatedAt).Take(1))
            .FirstOrDefaultAsync(b => b.Id == id);

        if (box == null)
        {
            return NotFound();
        }

        return Ok(new BoxDto
        {
            Id = box.Id,
            Name = box.Name,
            SpaceId = box.SpaceId,
            ZoneId = box.ZoneId,
            LabelCode = box.LabelCode,
            ImageUri = box.BoxImages.FirstOrDefault()?.Uri,
            CreatedAt = box.CreatedAt,
            UpdatedAt = box.UpdatedAt
        });
    }

    // GET: api/Boxes/space/5
    [HttpGet("space/{spaceId}")]
    public async Task<ActionResult<IEnumerable<BoxDto>>> GetBoxesBySpace(int spaceId)
    {
        var boxes = await _context.Boxes
            .Where(b => b.SpaceId == spaceId)
            .Include(b => b.BoxImages.OrderByDescending(img => img.CreatedAt).Take(1))
            .OrderBy(b => b.Name)
            .Select(b => new BoxDto
            {
                Id = b.Id,
                Name = b.Name,
                SpaceId = b.SpaceId,
                ZoneId = b.ZoneId,
                LabelCode = b.LabelCode,
                ImageUri = b.BoxImages.FirstOrDefault() != null ? b.BoxImages.First().Uri : null,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            })
            .ToListAsync();

        return Ok(boxes);
    }

    // POST: api/Boxes
    [HttpPost]
    public async Task<ActionResult<BoxDto>> CreateBox(CreateBoxDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Namn är obligatoriskt");
        }

        var space = await _context.Spaces.FindAsync(dto.SpaceId);
        if (space == null)
        {
            return BadRequest("Utrymme hittades inte");
        }

        if (dto.ZoneId.HasValue)
        {
            var zone = await _context.Zones.FindAsync(dto.ZoneId.Value);
            if (zone == null || zone.SpaceId != dto.SpaceId)
            {
                return BadRequest("Zon hittades inte eller tillhör inte utrymmet");
            }
        }

        var labelCode = GenerateLabelCode();
        var attempts = 0;
        while (await _context.Boxes.AnyAsync(b => b.LabelCode == labelCode) && attempts < 10)
        {
            labelCode = GenerateLabelCode();
            attempts++;
        }

        var box = new Box
        {
            Name = dto.Name.Trim(),
            SpaceId = dto.SpaceId,
            ZoneId = dto.ZoneId,
            LabelCode = labelCode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Boxes.Add(box);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(dto.ImageUri))
        {
            var boxImage = new BoxImage
            {
                BoxId = box.Id,
                Uri = dto.ImageUri,
                CreatedAt = DateTime.UtcNow
            };
            _context.BoxImages.Add(boxImage);
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetBox), new { id = box.Id }, new BoxDto
        {
            Id = box.Id,
            Name = box.Name,
            SpaceId = box.SpaceId,
            ZoneId = box.ZoneId,
            LabelCode = box.LabelCode,
            ImageUri = dto.ImageUri,
            CreatedAt = box.CreatedAt,
            UpdatedAt = box.UpdatedAt
        });
    }

    // PUT: api/Boxes/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBox(int id, UpdateBoxDto dto)
    {
        var box = await _context.Boxes
            .Include(b => b.BoxImages)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (box == null)
        {
            return NotFound();
        }

        if (dto.Name != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Namn är obligatoriskt");
            }
            box.Name = dto.Name.Trim();
        }

        if (dto.SpaceId.HasValue)
        {
            var space = await _context.Spaces.FindAsync(dto.SpaceId.Value);
            if (space == null)
            {
                return BadRequest("Utrymme hittades inte");
            }
            box.SpaceId = dto.SpaceId.Value;
        }

        if (dto.ZoneId.HasValue)
        {
            if (dto.ZoneId.Value != 0)
            {
                var zone = await _context.Zones.FindAsync(dto.ZoneId.Value);
                if (zone == null || zone.SpaceId != box.SpaceId)
                {
                    return BadRequest("Zon hittades inte eller tillhör inte utrymmet");
                }
            }
            box.ZoneId = dto.ZoneId.Value == 0 ? null : dto.ZoneId.Value;
        }

        // Handle image update
        if (dto.ImageUri != null)
        {
            // Remove old images
            _context.BoxImages.RemoveRange(box.BoxImages);

            // Add new image if provided
            if (!string.IsNullOrWhiteSpace(dto.ImageUri))
            {
                var boxImage = new BoxImage
                {
                    BoxId = box.Id,
                    Uri = dto.ImageUri,
                    CreatedAt = DateTime.UtcNow
                };
                _context.BoxImages.Add(boxImage);
            }
        }

        box.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Boxes/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBox(int id)
    {
        var box = await _context.Boxes.FindAsync(id);
        if (box == null)
        {
            return NotFound();
        }

        _context.Boxes.Remove(box);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/Boxes/5/move
    [HttpPost("{id}/move")]
    public async Task<IActionResult> MoveBox(int id, MoveBoxDto dto)
    {
        var box = await _context.Boxes.FindAsync(id);
        if (box == null)
        {
            return NotFound();
        }

        var space = await _context.Spaces.FindAsync(dto.NewSpaceId);
        if (space == null)
        {
            return BadRequest("Utrymme hittades inte");
        }

        if (dto.NewZoneId.HasValue)
        {
            var zone = await _context.Zones.FindAsync(dto.NewZoneId.Value);
            if (zone == null || zone.SpaceId != dto.NewSpaceId)
            {
                return BadRequest("Zon hittades inte eller tillhör inte utrymmet");
            }
        }

        // Move box
        box.SpaceId = dto.NewSpaceId;
        box.ZoneId = dto.NewZoneId;
        box.UpdatedAt = DateTime.UtcNow;

        // Move all items in the box
        var items = await _context.Items.Where(i => i.BoxId == id).ToListAsync();
        foreach (var item in items)
        {
            item.SpaceId = dto.NewSpaceId;
            item.ZoneId = dto.NewZoneId;
            item.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private string GenerateLabelCode()
    {
        var randomPart = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
        return $"BOX-{randomPart}";
    }
}
