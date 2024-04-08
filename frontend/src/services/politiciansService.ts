import type {
  GetAllPoliticiansSearchParams,
  Politician,
} from "@/types/politicians";

class PoliticianService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "http://localhost:8080";
  }

  async getPoliticians(
    params?: GetAllPoliticiansSearchParams,
  ): Promise<Politician[]> {
    let url = `${this.baseUrl}/politicians`;

    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.perPage)
        queryParams.append("per_page", params.perPage.toString());
      if (params.name) queryParams.append("name", params.name);
      if (params.party) queryParams.append("party", params.party);
      if (params.gender) queryParams.append("gender", params.gender);

      if (queryParams.toString() !== "") {
        url += `?${queryParams.toString()}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch politicians");
    }
    return await response.json();
  }

  async getPoliticianById(id: number): Promise<Politician> {
    const response = await fetch(`${this.baseUrl}/politicians/${id}`);
    if (!response.ok) {
      throw new Error("Politician not found");
    }
    return await response.json();
  }

  async updatePolitician(
    id: number,
    newData: Politician,
  ): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/politicians/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });
    if (!response.ok) {
      throw new Error("Failed to update politician");
    }
    return await response.json();
  }

  async deletePolitician(id: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/politicians/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete politician");
    }
    return await response.json();
  }
}

export const politicianService = new PoliticianService();
