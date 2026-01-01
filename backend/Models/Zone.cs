using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Zone
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int SpaceId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(SpaceId))]
    public Space Space { get; set; } = null!;

    public ICollection<Box> Boxes { get; set; } = new List<Box>();
    public ICollection<Item> Items { get; set; } = new List<Item>();
}
