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

    public Material CreateMaterial(long userId, DateTime creationDate, Content content)
    {
        var user = _context.Users.Find(userId)
                   ?? throw new KeyNotFoundException("User not found");

        var material = new Material
        {
            CreationDate = creationDate,
            Content = content,
            UserId = userId
        };

        _context.Materials.Add(material);
        _context.SaveChanges();
        return material;
    }

    public void DeleteMaterial(long materialId)
    {
        var material = _context.Materials
                           .Include(m => m.Content)
                           .FirstOrDefault(m => m.MaterialId == materialId)
                       ?? throw new KeyNotFoundException("Material not found");

        _context.Materials.Remove(material);

        if (material.Content != null)
        {
            _context.Contents.Remove(material.Content);
        }

        _context.SaveChanges();
    }

    public Material UpdateContent(long materialId, Dictionary<string, object> newData)
    {
        var material = _context.Materials
                           .Include(m => m.Content)
                           .FirstOrDefault(m => m.MaterialId == materialId)
                       ?? throw new KeyNotFoundException("Material not found");

        material.Content ??= new Content
        {
            Text = ""
        };

        foreach (var kvp in newData)
        {
            material.Content.Text += kvp.Value.ToString();
        }

        _context.SaveChanges();
        return material;
    }

    public List<Material> GetAllMaterials()
    {
        return _context.Materials
            .Include(m => m.Content)
            .OrderByDescending(m => m.CreationDate)
            .ToList();
    }

    public Material GetMaterialById(long id)
    {
        return _context.Materials
                   .Include(m => m.Content)
                   .FirstOrDefault(m => m.MaterialId == id)
               ?? throw new KeyNotFoundException("Material not found");
    }

    public List<Material> GetMaterialsByUserId(long userId)
    {
        return _context.Materials
            .Include(m => m.Content)
            .Where(m => EF.Property<long>(m, "UserId") == userId)
            .OrderByDescending(m => m.CreationDate)
            .ToList();
    }
}