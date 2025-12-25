import { ref } from "vue";

export function useProductAddons({ toast, maxGroups, maxOptions }) {
  const addOnGroups = ref([]);
  const expandedAddOnGroups = ref(new Set());

  const createAddOnOption = () => ({
    id: null, // backend id
    clientKey: crypto.randomUUID(), // 🔥 frontend key
    name: "",
    price: 0,
  });

  const createAddOnGroup = () => {
    const clientKey = crypto.randomUUID();

    return {
      id: null, // backend id
      clientKey, // 🔥 frontend key
      name: "",
      min_selection: 0,
      max_selection: 1,
      options: [createAddOnOption()],
    };
  };

  const addAddOnGroup = () => {
    if (addOnGroups.value.length >= maxGroups) {
      toast.warning("Maksimal grup add-on tercapai");
      return;
    }
    const id = Date.now() + Math.random();
    addOnGroups.value.push({
      id,
      name: "",
      min_selection: 0,
      max_selection: 1,
      options: [{ id: Date.now(), name: "", price: 0 }],
    });
    expandedAddOnGroups.value.add(id);
  };

  const addAddOnGroupEdit = () => {
    if (addOnGroups.value.length >= maxGroups) {
      toast.warning("Maksimal grup add-on tercapai");
      return;
    }

    const group = createAddOnGroup();
    addOnGroups.value.push(group);
    expandedAddOnGroups.value.add(group.clientKey);
  };

  const removeAddOnGroup = (idx) => {
    addOnGroups.value.splice(idx, 1);
  };

  const removeAddOnGroupEdit = (idx) => {
    const group = addOnGroups.value[idx];
    if (group?.clientKey) {
      expandedAddOnGroups.value.delete(group.clientKey);
    }
    addOnGroups.value.splice(idx, 1);
  };

  const addAddOnOption = (gIdx) => {
    addOnGroups.value[gIdx].options.push({
      id: Date.now(),
      name: "",
      price: 0,
    });
  };

  const addAddOnOptionEdit = (gIdx) => {
    const group = addOnGroups.value[gIdx];
    if (!group) return;

    if (group.options.length >= maxOptions) {
      toast.warning(`Maksimal ${maxOptions} opsi per grup`);
      return;
    }

    group.options.push(createAddOnOption());
  };

  const removeAddOnOption = (gIdx, oIdx) => {
    addOnGroups.value[gIdx].options.splice(oIdx, 1);
  };

  const toggleAddOnGroupExpand = (id) => {
    expandedAddOnGroups.value.has(id)
      ? expandedAddOnGroups.value.delete(id)
      : expandedAddOnGroups.value.add(id);
  };

  const isAddOnGroupExpanded = (id) => expandedAddOnGroups.value.has(id);
  const isAddOnGroupExpandedEdit = (clientKey) =>
    expandedAddOnGroups.value.has(clientKey);

  return {
    addOnGroups,
    expandedAddOnGroups,
    addAddOnGroup,
    addAddOnGroupEdit,
    removeAddOnGroupEdit,
    removeAddOnGroup,
    addAddOnOption,
    removeAddOnOption,
    addAddOnOptionEdit,
    toggleAddOnGroupExpand,
    isAddOnGroupExpanded,
    isAddOnGroupExpandedEdit,
  };
}
