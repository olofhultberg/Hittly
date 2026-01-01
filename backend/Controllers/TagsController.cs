using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TagsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Tags
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TagDto>>> GetTags()
    {
        var tags = await _context.Tags
            .OrderBy(t => t.Name)
            .Select(t => new TagDto
            {
                Id = t.Id,
                Name = t.Name
            })
            .ToListAsync();

        return Ok(tags);
    }

    // GET: api/Tags/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TagDto>> GetTag(int id)
    {
        var tag = await _context.Tags.FindAsync(id);

        if (tag == null)
        {
            return NotFound();
        }

        return Ok(new TagDto
        {
            Id = tag.Id,
            Name = tag.Name
        });
    }
}
