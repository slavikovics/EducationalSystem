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

    public Material CreateMaterial(long userId, DateTime creationDate, Content content)
    {
        return _materialsRepository.CreateMaterial(userId, creationDate, content);
    }

    public void DeleteMaterial(long materialId)
    {
        _materialsRepository.DeleteMaterial(materialId);
    }

    public List<Material> GetAllMaterials()
    {
        return _materialsRepository.GetAllMaterials();
    }

    public Material GetMaterialById(long id)
    {
        return _materialsRepository.GetMaterialById(id);
    }

    public List<Material> GetMaterialsByUserId(long userId)
    {
        return _materialsRepository.GetMaterialsByUserId(userId);
    }

    public Material UpdateContent(long materialId, Dictionary<string, object> newData)
    {
        return _materialsRepository.UpdateContent(materialId, newData);
    }
}