using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Space
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Zone> Zones { get; set; } = new List<Zone>();
    public ICollection<Box> Boxes { get; set; } = new List<Box>();
    public ICollection<Item> Items { get; set; } = new List<Item>();
}
