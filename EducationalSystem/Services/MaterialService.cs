using EducationalSystem.Models;
using EducationalSystem.Repositories;

namespace EducationalSystem.Services;

public class MaterialService : IMaterialService
{
    private readonly IMaterialsRepository _materialsRepository;

    public MaterialService(IMaterialsRepository materialsRepository)
    {
        _materialsRepository = materialsRepository;
    }

    public async Task<Material> CreateMaterial(long userId, DateTime creationDate, Content content, ContentCategory category)
    {
        return await _materialsRepository.CreateMaterial(userId, creationDate, content, category);
    }

    public async Task DeleteMaterial(long materialId)
    {
        await _materialsRepository.DeleteMaterial(materialId);
    }

    public async Task<List<Material>> GetAllMaterials()
    {
        return await _materialsRepository.GetAllMaterials();
    }

    public async Task<Material> GetMaterialById(long id)
    {
        return await _materialsRepository.GetMaterialById(id);
    }

    public async Task<List<Material>> GetMaterialsByUserId(long userId)
    {
        return await _materialsRepository.GetMaterialsByUserId(userId);
    }

    public async Task<Material> UpdateContent(long materialId, Content newContent)
    {
        return await _materialsRepository.UpdateContent(materialId, newContent);
    }
}