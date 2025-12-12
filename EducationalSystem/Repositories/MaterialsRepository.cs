using EducationalSystem.Data;
using EducationalSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem.Repositories;

public class MaterialsRepository : IMaterialsRepository
{
    private readonly EducationalSystemDbContext _context;

    public MaterialsRepository(EducationalSystemDbContext context)
    {
        _context = context;
    }

    public async Task<Material> CreateMaterial(long userId, DateTime creationDate, Content content, ContentCategory category)
    {
        var user = await _context.Users.FindAsync(userId)
                   ?? throw new KeyNotFoundException("User not found");
        
        _context.Contents.Add(content);
        await _context.SaveChangesAsync();

        var material = new Material
        {
            CreationDate = creationDate,
            ContentId = content.ContentId,
            Content = content,
            UserId = userId,
            Category = category
        };

        _context.Materials.Add(material);
        await _context.SaveChangesAsync();

        return await _context.Materials
            .Include(m => m.Content)
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.MaterialId == material.MaterialId);
    }

    public async Task DeleteMaterial(long materialId)
    {
        var material = await _context.Materials
                           .Include(m => m.Content)
                           .FirstOrDefaultAsync(m => m.MaterialId == materialId)
                       ?? throw new KeyNotFoundException("Material not found");

        _context.Materials.Remove(material);

        if (material.Content != null)
        {
            _context.Contents.Remove(material.Content);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<Material> UpdateContent(long materialId, Content newContent)
    {
        var material = await _context.Materials
                           .Include(m => m.Content)
                           .FirstOrDefaultAsync(m => m.MaterialId == materialId)
                       ?? throw new KeyNotFoundException("Material not found");

        material.Content = newContent;

        await _context.SaveChangesAsync();
        return material;
    }

    public async Task<List<Material>> GetAllMaterials()
    {
        return await _context.Materials
            .Include(m => m.Content)
            .OrderByDescending(m => m.CreationDate)
            .ToListAsync();
    }

    public async Task<Material> GetMaterialById(long id)
    {
        return await _context.Materials
                   .Include(m => m.Content)
                   .FirstOrDefaultAsync(m => m.MaterialId == id)
               ?? throw new KeyNotFoundException("Material not found");
    }

    public async Task<List<Material>> GetMaterialsByUserId(long userId)
    {
        return await _context.Materials
            .Include(m => m.Content)
            .Where(m => EF.Property<long>(m, "UserId") == userId)
            .OrderByDescending(m => m.CreationDate)
            .ToListAsync();
    }
}