using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Space> Spaces { get; set; }
    public DbSet<Zone> Zones { get; set; }
    public DbSet<Box> Boxes { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<ItemTag> ItemTags { get; set; }
    public DbSet<ItemImage> ItemImages { get; set; }
    public DbSet<BoxImage> BoxImages { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure Space
        builder.Entity<Space>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // Configure Zone
        builder.Entity<Zone>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.SpaceId).IsRequired();
            entity.HasOne(e => e.Space)
                .WithMany(s => s.Zones)
                .HasForeignKey(e => e.SpaceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Box
        builder.Entity<Box>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.SpaceId).IsRequired();
            entity.Property(e => e.LabelCode).HasMaxLength(50);
            entity.HasIndex(e => e.LabelCode).IsUnique();
            entity.HasOne(e => e.Space)
                .WithMany(s => s.Boxes)
                .HasForeignKey(e => e.SpaceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Zone)
                .WithMany(z => z.Boxes)
                .HasForeignKey(e => e.ZoneId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure Item
        builder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.SpaceId).IsRequired();
            entity.Property(e => e.BoxId).IsRequired();
            entity.HasOne(e => e.Space)
                .WithMany(s => s.Items)
                .HasForeignKey(e => e.SpaceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Zone)
                .WithMany(z => z.Items)
                .HasForeignKey(e => e.ZoneId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Box)
                .WithMany(b => b.Items)
                .HasForeignKey(e => e.BoxId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Tag
        builder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Configure ItemTag (many-to-many)
        builder.Entity<ItemTag>(entity =>
        {
            entity.HasKey(e => new { e.ItemId, e.TagId });
            entity.HasOne(e => e.Item)
                .WithMany(i => i.ItemTags)
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Tag)
                .WithMany(t => t.ItemTags)
                .HasForeignKey(e => e.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure ItemImage
        builder.Entity<ItemImage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Uri).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.Item)
                .WithMany(i => i.ItemImages)
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure BoxImage
        builder.Entity<BoxImage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Uri).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.Box)
                .WithMany(b => b.BoxImages)
                .HasForeignKey(e => e.BoxId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
