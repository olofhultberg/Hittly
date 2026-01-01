namespace backend.DTOs;

public class SpaceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateSpaceDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateSpaceDto
{
    public string Name { get; set; } = string.Empty;
}
