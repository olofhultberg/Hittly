namespace backend.DTOs;

public class BoxDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SpaceId { get; set; }
    public int? ZoneId { get; set; }
    public string? LabelCode { get; set; }
    public string? ImageUri { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateBoxDto
{
    public string Name { get; set; } = string.Empty;
    public int SpaceId { get; set; }
    public int? ZoneId { get; set; }
    public string? ImageUri { get; set; }
}

public class UpdateBoxDto
{
    public string? Name { get; set; }
    public int? SpaceId { get; set; }
    public int? ZoneId { get; set; }
    public string? ImageUri { get; set; }
}

public class MoveBoxDto
{
    public int NewSpaceId { get; set; }
    public int? NewZoneId { get; set; }
}
