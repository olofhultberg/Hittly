using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class ItemImage
{
    public int Id { get; set; }

    [Required]
    public int ItemId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Uri { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(ItemId))]
    public Item Item { get; set; } = null!;
}
