using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ItemsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Items
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems()
    {
        var items = await _context.Items
            .Include(i => i.ItemTags)
                .ThenInclude(it => it.Tag)
            .Include(i => i.ItemImages.OrderByDescending(img => img.CreatedAt).Take(1))
            .OrderBy(i => i.Name)
            .Select(i => new ItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Description = i.Description,
                SpaceId = i.SpaceId,
                ZoneId = i.ZoneId,
                BoxId = i.BoxId,
                Tags = i.ItemTags.Select(it => new TagDto
                {
                    Id = it.Tag.Id,
                    Name = it.Tag.Name
                }).ToList(),
                ImageUri = i.ItemImages.FirstOrDefault() != null ? i.ItemImages.First().Uri : null,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    // GET: api/Items/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ItemDto>> GetItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.ItemTags)
                .ThenInclude(it => it.Tag)
            .Include(i => i.ItemImages.OrderByDescending(img => img.CreatedAt).Take(1))
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        return Ok(new ItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description,
            SpaceId = item.SpaceId,
            ZoneId = item.ZoneId,
            BoxId = item.BoxId,
            Tags = item.ItemTags.Select(it => new TagDto
            {
                Id = it.Tag.Id,
                Name = it.Tag.Name
            }).ToList(),
            ImageUri = item.ItemImages.FirstOrDefault()?.Uri,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        });
    }

    // GET: api/Items/box/5
    [HttpGet("box/{boxId}")]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetItemsByBox(int boxId)
    {
        var items = await _context.Items
            .Where(i => i.BoxId == boxId)
            .Include(i => i.ItemTags)
                .ThenInclude(it => it.Tag)
            .Include(i => i.ItemImages.OrderByDescending(img => img.CreatedAt).Take(1))
            .OrderBy(i => i.Name)
            .Select(i => new ItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Description = i.Description,
                SpaceId = i.SpaceId,
                ZoneId = i.ZoneId,
                BoxId = i.BoxId,
                Tags = i.ItemTags.Select(it => new TagDto
                {
                    Id = it.Tag.Id,
                    Name = it.Tag.Name
                }).ToList(),
                ImageUri = i.ItemImages.FirstOrDefault() != null ? i.ItemImages.First().Uri : null,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    // POST: api/Items
    [HttpPost]
    public async Task<ActionResult<ItemDto>> CreateItem(CreateItemDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Namn är obligatoriskt");
        }

        var box = await _context.Boxes.FindAsync(dto.BoxId);
        if (box == null)
        {
            return BadRequest("Låda hittades inte");
        }

        if (dto.SpaceId != box.SpaceId)
        {
            return BadRequest("SpaceId måste matcha lådans utrymme");
        }

        if (dto.ZoneId.HasValue && dto.ZoneId != box.ZoneId)
        {
            return BadRequest("ZoneId måste matcha lådans zon");
        }

        var item = new Item
        {
            Name = dto.Name.Trim(),
            Description = dto.Description ?? string.Empty,
            SpaceId = dto.SpaceId,
            ZoneId = dto.ZoneId,
            BoxId = dto.BoxId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(dto.ImageUri))
        {
            var itemImage = new ItemImage
            {
                ItemId = item.Id,
                Uri = dto.ImageUri,
                CreatedAt = DateTime.UtcNow
            };
            _context.ItemImages.Add(itemImage);
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, new ItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description,
            SpaceId = item.SpaceId,
            ZoneId = item.ZoneId,
            BoxId = item.BoxId,
            Tags = new List<TagDto>(),
            ImageUri = dto.ImageUri,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        });
    }

    // PUT: api/Items/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, UpdateItemDto dto)
    {
        var item = await _context.Items
            .Include(i => i.ItemImages)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        if (dto.Name != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Namn är obligatoriskt");
            }
            item.Name = dto.Name.Trim();
        }

        if (dto.Description != null)
        {
            item.Description = dto.Description;
        }

        if (dto.SpaceId.HasValue)
        {
            item.SpaceId = dto.SpaceId.Value;
        }

        if (dto.ZoneId.HasValue)
        {
            item.ZoneId = dto.ZoneId.Value == 0 ? null : dto.ZoneId.Value;
        }

        if (dto.BoxId.HasValue)
        {
            var box = await _context.Boxes.FindAsync(dto.BoxId.Value);
            if (box == null)
            {
                return BadRequest("Låda hittades inte");
            }
            item.BoxId = dto.BoxId.Value;
            item.SpaceId = box.SpaceId;
            item.ZoneId = box.ZoneId;
        }

        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Items/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/Items/5/tags
    [HttpPost("{id}/tags")]
    public async Task<IActionResult> AddTagToItem(int id, [FromBody] string tagName)
    {
        if (string.IsNullOrWhiteSpace(tagName))
        {
            return BadRequest("Tagg-namn är obligatoriskt");
        }

        var item = await _context.Items.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        var normalizedTagName = tagName.Trim().ToLower();
        var tag = await _context.Tags
            .FirstOrDefaultAsync(t => t.Name.ToLower() == normalizedTagName);

        if (tag == null)
        {
            tag = new Tag
            {
                Name = normalizedTagName,
                CreatedAt = DateTime.UtcNow
            };
            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();
        }

        var existingItemTag = await _context.ItemTags
            .FirstOrDefaultAsync(it => it.ItemId == id && it.TagId == tag.Id);

        if (existingItemTag == null)
        {
            var itemTag = new ItemTag
            {
                ItemId = id,
                TagId = tag.Id
            };
            _context.ItemTags.Add(itemTag);
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    // DELETE: api/Items/5/tags
    [HttpDelete("{id}/tags")]
    public async Task<IActionResult> RemoveTagFromItem(int id, [FromQuery] string tagName)
    {
        if (string.IsNullOrWhiteSpace(tagName))
        {
            return BadRequest("Tagg-namn är obligatoriskt");
        }

        var item = await _context.Items.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        var normalizedTagName = tagName.Trim().ToLower();
        var tag = await _context.Tags
            .FirstOrDefaultAsync(t => t.Name.ToLower() == normalizedTagName);

        if (tag != null)
        {
            var itemTag = await _context.ItemTags
                .FirstOrDefaultAsync(it => it.ItemId == id && it.TagId == tag.Id);

            if (itemTag != null)
            {
                _context.ItemTags.Remove(itemTag);
                await _context.SaveChangesAsync();
            }
        }

        return NoContent();
    }
}
