using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class BoxImage
{
    public int Id { get; set; }

    [Required]
    public int BoxId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Uri { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(BoxId))]
    public Box Box { get; set; } = null!;
}
