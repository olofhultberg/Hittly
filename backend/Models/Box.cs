using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Box
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int SpaceId { get; set; }

    public int? ZoneId { get; set; }

    [MaxLength(50)]
    public string? LabelCode { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(SpaceId))]
    public Space Space { get; set; } = null!;

    [ForeignKey(nameof(ZoneId))]
    public Zone? Zone { get; set; }

    public ICollection<Item> Items { get; set; } = new List<Item>();
    public ICollection<BoxImage> BoxImages { get; set; } = new List<BoxImage>();
}
