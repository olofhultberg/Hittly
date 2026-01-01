namespace backend.DTOs;

public class ItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SpaceId { get; set; }
    public int? ZoneId { get; set; }
    public int BoxId { get; set; }
    public List<TagDto> Tags { get; set; } = new();
    public string? ImageUri { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SpaceId { get; set; }
    public int? ZoneId { get; set; }
    public int BoxId { get; set; }
    public string? ImageUri { get; set; }
}

public class UpdateItemDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? SpaceId { get; set; }
    public int? ZoneId { get; set; }
    public int? BoxId { get; set; }
}

public class TagDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
