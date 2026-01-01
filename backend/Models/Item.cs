using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Item
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required]
    public int SpaceId { get; set; }

    public int? ZoneId { get; set; }

    [Required]
    public int BoxId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(SpaceId))]
    public Space Space { get; set; } = null!;

    [ForeignKey(nameof(ZoneId))]
    public Zone? Zone { get; set; }

    [ForeignKey(nameof(BoxId))]
    public Box Box { get; set; } = null!;

    public ICollection<ItemTag> ItemTags { get; set; } = new List<ItemTag>();
    public ICollection<ItemImage> ItemImages { get; set; } = new List<ItemImage>();
}
