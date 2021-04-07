const mockRepository = <E, R = any>(
  repo,
  method: Extract<keyof R, string>,
  data: Partial<E>
) => {
  return jest.spyOn(repo, method).mockReturnValue(data);
};

export default mockRepository;
