using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Tag
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<ItemTag> ItemTags { get; set; } = new List<ItemTag>();
}
