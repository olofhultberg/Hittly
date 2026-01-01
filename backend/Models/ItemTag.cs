using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("ItemTags")]
public class ItemTag
{
    public int ItemId { get; set; }
    public int TagId { get; set; }

    // Navigation properties
    [ForeignKey(nameof(ItemId))]
    public Item Item { get; set; } = null!;

    [ForeignKey(nameof(TagId))]
    public Tag Tag { get; set; } = null!;
}
