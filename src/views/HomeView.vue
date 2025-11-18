<script setup>
import { ref, computed } from 'vue';

// Mock data
const categories = ['kuliner', 'toko', 'jasa'];
const imagesByCat = {
  kuliner: 'https://cdn-brilio-net.akamaized.net/news/2019/11/05/173525/1200xauto-20-resep-makanan-khas-daerah-mudah-dibuat-191105e-rev1.jpg',
  toko: 'https://ottopay.id/lkapps/wp-content/uploads/2022/08/14-0-liputan4-com-1200x900.jpg',
  jasa: 'https://siplah-oss.tokoladang.co.id/merchant/8301/product/f4iYiNjGYfkw2Dc36MbeqUFkugDUZjsTYBh6flVO.jpg'
};

const mockProducts = ref(
  categories.flatMap(cat =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `${cat}-${i + 1}`,
      image: imagesByCat[cat],
      title: `${cat[0].toUpperCase()}${cat.slice(1)} ${i + 1}`,
      description: 'Deskripsi singkat',
      rating: 4.4,
      distance: 2,
      category: cat
    }))
  )
);

// Filter state 
const activeFilter = ref(null);
const filteredProducts = computed(() =>
  activeFilter.value ? mockProducts.value.filter(p => p.category === activeFilter.value) : mockProducts.value
);

const displayedProducts = computed(() => filteredProducts.value.slice(0, 12));

// Toggle filter
function toggleFilter(cat) {
  activeFilter.value = activeFilter.value === cat ? null : cat;
}

// Menu items 
const menuItems = [
  {
    key: 'kuliner',
    label: 'Kuliner',
    to: '#',
    svg: `<svg width="98" height="66" viewBox="0 0 98 66" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="98" height="66" rx="10" fill="#FFA30E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M54.8098 10.7498C55.3973 10.366 56.1611 10.3532 56.8298 10.8497C60.7269 13.7431 66.0369 21.5892 66.5706 33.6026C66.6332 34.9998 65.9517 36.3687 64.6259 36.9846C63.6634 37.4311 62.3151 37.9442 60.5791 38.3427L62.1144 49.0891C62.2916 50.3346 62.1418 51.5497 61.6131 52.5524C61.0784 53.5658 60.1707 54.3325 58.9057 54.6811C56.5361 55.3322 53.8855 53.7724 53.8855 51.1766V12.5808C53.8855 11.8063 54.2429 11.1219 54.8098 10.7498ZM30.4442 13.3348C30.7164 11.7309 32.1166 10.6166 33.7186 10.6166H34.0045C34.0707 10.6165 34.1363 10.6299 34.1972 10.6559C34.2581 10.6819 34.3131 10.72 34.3589 10.7679C34.4046 10.8158 34.4402 10.8724 34.4635 10.9344C34.4867 10.9965 34.4971 11.0626 34.4941 11.1287L34.0583 20.6952C34.0511 20.8558 34.0755 21.0162 34.1302 21.1674C34.185 21.3186 34.269 21.4575 34.3774 21.5762C34.4858 21.6949 34.6166 21.791 34.7622 21.8592C34.9078 21.9274 35.0654 21.9662 35.226 21.9735C35.3866 21.9807 35.547 21.9563 35.6982 21.9016C35.8494 21.8468 35.9883 21.7628 36.107 21.6544C36.2257 21.546 36.3218 21.4152 36.39 21.2696C36.4582 21.124 36.497 20.9664 36.5043 20.8058L36.9459 11.0847C36.9514 10.9586 37.0055 10.8395 37.0967 10.7523C37.1879 10.6651 37.3093 10.6165 37.4355 10.6166H39.9813C40.1075 10.6165 40.2289 10.6651 40.3201 10.7523C40.4113 10.8395 40.4653 10.9586 40.4709 11.0847L40.9125 20.8058C40.9273 21.1302 41.0703 21.4354 41.3102 21.6543C41.55 21.8731 41.8669 21.9878 42.1913 21.973C42.5156 21.9582 42.8208 21.8151 43.0397 21.5753C43.2586 21.3355 43.3733 21.0186 43.3585 20.6942L42.9237 11.1287C42.9207 11.0626 42.9311 10.9965 42.9543 10.9344C42.9775 10.8724 43.0131 10.8158 43.0589 10.7679C43.1047 10.72 43.1597 10.6819 43.2206 10.6559C43.2815 10.6299 43.3471 10.6165 43.4133 10.6166H43.6972C45.2992 10.6166 46.6994 11.7299 46.9716 13.3338C47.4249 16.0108 48.0594 20.6913 48.0085 25.6968C47.9801 28.4776 46.1187 30.9774 43.1979 31.6315C42.7709 31.7281 42.3244 31.8149 41.8584 31.892L43.662 49.0705C43.9322 51.6437 42.3303 54.2297 39.6631 54.6008C39.3471 54.6491 39.0281 54.6753 38.7084 54.6791C38.389 54.6753 38.0704 54.6491 37.7547 54.6008C35.0874 54.2287 33.4855 51.6437 33.7558 49.0705L35.5594 31.892C35.1108 31.8181 34.6644 31.7312 34.2209 31.6315C31.299 30.9774 29.4376 28.4776 29.4092 25.6968C29.3573 20.6913 29.9918 16.0108 30.4442 13.3348Z" fill="white"/>
</svg>`
  },
  {
    key: 'toko',
    label: 'Toko',
    to: '#',
    svg: `<svg width="98" height="66" viewBox="0 0 98 66" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="98" height="66" rx="10" fill="#FFA30E"/>
<rect x="24" y="8" width="50" height="50" fill="url(#pattern0_805_3991)"/>
<defs>
<pattern id="pattern0_805_3991" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_805_3991" transform="scale(0.02)"/>
</pattern>
<image id="image0_805_3991" width="50" height="50" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADmElEQVR4nO2aaYiNURjHbRnGNpmGDyhLlixhyNqkoSQiW5amplBkKSRk+UrIkqVRJGVNSfYPJnwg2ZW1SJFmLKPRGPsyPz3N/+Xtvfedee/1NreZ3n/d5tyzPOf5n/Ms554z9epFSBxAQ6AfkAdkBByTAawEzgCHgSFJTO0r/C5wDOgMjAYeA718+tYHFgEXgI/8w5YA8wwHXgHfgatAkcrjwiKyDCiR4C9SbIkUngm0dfVtQ3zcrmaOEcAn4CbQTXXpwA3gNdAsLDK9gd8+Sv4CCmwy7YiR9uJAFbI7Ae+NLNAyzi4Z5iSruK3GeuCFBH0AfqpsZpMLtAb6A7vUdt0UkY2Xe4gs95mnAXBF8jv49HkKnEqGRHvgOVABnAY2APtlWntt8jhjJsiej+r7EQ+Rkz5zzVX7rCr02Qe8TZREY9lpmRMxbHcCjl0jpXKAhR4i78zsPP2byf7vx1scj48amidCZI4GTQIaaSfMN2YEXIQ3wAmgbxw/eSZ5XdR/ueonyJS3AQuAHh65s9SvSyJELgIPVN4k87K/LQKO3wp8Bo7jj1IgG3gJXNO41grrDsyMd6ptoup6BiVRX7F/u1bIzKsg8CpUyphKMJhzG6Z5xncEZgMHgXNKqtMTJWI2a1gBDFU5N0EigwmOEiAtgMz56h8b1YDNwHhPXb4GmNOOVTlPq5PtM0m6zGmFQqmzekGww5VELTLlVxNEdsZrtDj/1VZe38e48oTZ90CVzd4N34DF7sijJPlIfoT8y1k9L5w+buwBRgLFrrpDbn8EWgGX1VbuR8QJi5PkD24sU15wYCES5ZVMYJ6OK0VKjvmS6VW4QjvWVecnN8oUER8CfYBVWkyLbgOAQcpn3xUIqiQSFDkKjV9dY80Zs1wyuwP3PD7w98CncL7Oc9TZAzR19Rmq04Qp/0NEjNDG0IhonOWHS8BSb4JTe5qddC2TA+18bH6Udmd6FUf5A8o5rVQXLpFUgYhILCIiYYCISCwiImGAiEhAIjrtXtHlQel/fIp1OM2qcSI2qZQIE2dTQWQy4eMn0KSmiTi/pcNGZkQkACIiSSAzIpIkkSnUkajVxnU/FRbOpSqzD7Pbwv/M6qV2SW0X4LY4KSFSUyAiEouISBggIhKLiEgYICJSi4gUUbuIHLF/74jXsLu2EKHyScMemnb5Xd0/SYDILaAwBZ87ek955Dwx+L3/rQXOp0jJwgAf0221+zGoTuEPCWs+MCl4+SAAAAAASUVORK5CYII="/>
</defs>
</svg>`
  },
  {
    key: 'jasa',
    label: 'Jasa',
    to: '#',
    svg: `<svg width="98" height="66" viewBox="0 0 98 66" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="98" height="66" rx="10" fill="#FFA30E"/>
<rect x="25" y="9" width="47" height="47" fill="url(#pattern0_805_3995)"/>
<defs>
<pattern id="pattern0_805_3995" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_805_3995" transform="scale(0.02)"/>
</pattern>
<image id="image0_805_3995" width="50" height="50" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEXUlEQVR4nM2abYiVRRTHb+YLmaUJkWTpFzFCS9eVIvsQIWEqFFFQBBGohZVZSFFEkEhmEeRLKeVXoyBSioi+VEIo24tSBGlqhKbt6uZWtGmp3f3F0fPQ4zgzzzwzc7f7h/2w93nmzPndmXPOvNxGo9FoAFcCXwGPAcMa/4OAocCtwGqgCzgC/ArsAqaEGBCIH/hP0nDOoHh/pv9RwLNAN+eqCSwKNSQjYdMHwOQWAgwDlgG9jv6bwRBqUKaTSyeBtcDozBAyC7Z5+h0AHor5ZmQ6+XQYuCITxA1An6evZq2RMIzPoVpjMkCM0yD2jcSi1E4kJlzqTYXQPl6t+LI25uhkMnDC0cEvwPhE+0PUjk+PJINoZy97OtmXAiMxRrW+BkZG2B5rfnCxBjaaFs3UuDcWBphEmD6tAwPMAra7vrnTgS1O60gkw4hzmpGywQAzgd/lL8SB8ep8DpgvAkEqYYBppTR+pE7aNGvNvrq1BXicevpMljAWO1cBPaX3ttVxInlkZIVQUQwrR0azq7kuWx0MkhHmaeqrC7gFuBf42fL85logqTDABOBH8uoAcH5tkFiYFkGIlkVBVCQAK4xlz5NLB4ELk0BCRwa4vEUjIbo7GSIUBrigYu8Rq03ZIEKnmabdbzNCdGWZUpEjMxHYD7yk66MpwP2l2JG9yAZ9x6fNtiI52DBDLW1k6n0IPKz/DwfuAt7W2OrX2rEFmN9SgJowM2S1CnwOXK+fDWm0g4DzgHXAPRUwd+hqtVB/0JnVIELI3Bb9UwFj0zPtBkEkzPx2hCjUUxy9Anfi1/sS8O0IIVqq792kcVAlKZiXtBuEqFPTqOs41CY5K+jWzdTc3E4P10LWqYcHIwMgRDfKyYYWuRgNFKOaCnAb8B5wLNKR5WpnTWT7AubRWICJmRZ4fwLX6qHcCuB7rTO9ns3RXw6YJXUhZlScy9bVu5Y+plpg9ihwh2M/P1AsX0IgZM9wKCPEDlcWUphy7Mj07dBnHR6Y6msG4B2PU6d02fx8YKV2QpSuMUz1BcIs9kFMt2SXEzqnby9f8gRUai9Eyc7+BJgHXUZftDT4xOOEC6Y3tKh5Dur6DJijDpgHbEZ31l3IOWBOhh4+a1HdmADTBBaaRm0p8boAZyRmTF0dAlKCecMBczQQZkHZoHm581vIgZcmAFMzQ0FKMK8nwtxXGDPT7scBDozWbGZqQh2QEsyGBJi/gWvkha11q6lmM1P9sb+aUJj1CTBvysMnLQ+8MJqaTW2OgTBgXouE6S4y0HEfjMSMJADJZpKaHZem81JASjDrPDDT9b1O4/brWGFglaPxgDouCcCnrakQBsxaD0ynXg+Wv8xvisYj9IgmRj25fhVhwLi2AE3LjHiq3PjSiCX8T8Vw5xZnYF4J8OG7c/b8OjIvOGLGnHJvAZe1AqJxtk9SeF07zd2yh/I1lmX9ExofUmdkKGUKfQmsPJ23B1HAbOAj4A89bpKN2nPARcVL/wL+AvcLp53bYAAAAABJRU5ErkJggg=="/>
</defs>
</svg>`
  },
  {
    key: 'komunitas',
    label: 'Komunitas',
    to: '#',
    svg: `<svg width="98" height="66" viewBox="0 0 98 66" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="98" height="66" rx="10" fill="#FFA30E"/>
<rect x="16" width="65" height="65" fill="url(#pattern0_805_3999)"/>
<defs>
<pattern id="pattern0_805_3999" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_805_3999" transform="scale(0.02)"/>
</pattern>
<image id="image0_805_3999" width="50" height="50" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADRElEQVR4nO2YSUhVURjHn2YRoVmLoqSyqBa1qVWzaQPRsGgjZLVKGshsIAhphCIaFk20aGEgURq5zIKyQhKxRbQQLIxKbRFlA4XZRNYvDh7j43TePfed97SC+4O3uv/z/77/ve+e4cZiERERERERERFxAdKBIqAaaAc+6V8jsDL2PwCMBR4QzF5gcOxfBRgGtBGOb8AZYODfaDQXOApcBs4CS4zr50icw4bHUu1dBRwBxqU6xBzgo9HEcXE9G/jsEaQLyBQ+J43rquasVASYAFwFOi1NFArdMvz5/WTpmSRMOnUPub4hBgCPAhrIE9ptSQRZL3zyA3TNqiefIIsdDUwT2j1JBNktfKY7tIt8gpxymOYL7bokghQLn/kO7QmfIGpBC2Kz0I4HfnqEUGMmCp9NDv0VnyC1DtMiY2pWM1CidMmXGFjt0N/0CXLRYVogtFvwp0T4FDi0F3yCFDtM5fS7IIkg8oYUhn2fEgmy32F6UmjTgPMeIcrVWOFz2qHf5xNEbROCeCVXZT1G7XbD0maMzQQ6HGMqfYKUhmim3BizNYEgpcbYME+0xHdlrwxhvkaMyQBuhRhTK1fpELOV4pLXyq4L5OGmXW7HgSygJUDfYmwUM0Ju/+d6hUhgPamxjKkL0NdZ9NccNW4kFUIXGQM8j1PgCZBjGdMQ0FSDRZ8DPA144n/U8A1TYZi/AXYBQyza2UB3QJBu2xlDedHjqbwlFakKMQh4qE2/61NilkWn1pKSkFuVLq1Ns/hkAcd0rd7te3JHYmAkcF0bvgBmxPlqolbkJhKnSY9Nt/jO1DUVNcAI3w8JB4B32uixelcsT6BI37FkadZeaZavMqq24q3ebWSHCaD+p4eAD6KIMphk6KYC9aSeemCKUWuy7qGX98BB2/spDzWtQQueWLy+0nd8AVYZNddadM+AebZjrfrWZHLf2NStcMxIqaIbWG78jVUvJuqGLuwVDQ/YrG0wPvmojWJ/8RIYKupvDNBlx/TcbeMHMEoY7aD/2S7qj9Y92dipBHfjXGw1/n536H9uGz3E25PVxYwZQdJomLjOCn1Bh9HDvTi6170HqGrLr8wwiafry1+V0UNZGF1EREREREQsQX4BCV9qBmfIcjkAAAAASUVORK5CYII="/>
</defs>
</svg>`
  },
  {
    key: 'lainnya',
    label: 'Lainnya',
    to: '#',
    svg: `<svg width="98" height="66" viewBox="0 0 98 66" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="98" height="66" rx="10" fill="#FFA30E"/>
<rect width="56" height="54" transform="translate(21 6)" fill="url(#pattern0_805_4003)"/>
<defs>
<pattern id="pattern0_805_4003" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_805_4003" transform="matrix(0.0192857 0 0 0.02 0.0178571 0)"/>
</pattern>
<image id="image0_805_4003" width="50" height="50" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABUUlEQVR4nO2YQU7DMBBFvShLYAEcK80honAdVLGqijhIUXsGEHegvQNID5k6YmRRNyYohvKflN14nsax4sk4J/4IwBUwBVrgOvG0Ie7yVzmAc+AeeCMPH38HnBV3sBM8M4ynlGgMhwu7ZHkB1sBD4lmHOMuimIPdebWv+gaYJF/h59oJMDNrX786z2M4HFBHu9RLEIk2Jse0hMMBjQlY5QhMjpXJ0ZRwuPCJ61h+U7I0OdoSDqdCDCokA1RIBirkhwtpjuUeqQfeuifA1uSoSjic71tC/9Ixy+iDvODWrPV5Lko4Pgi9vmXTszO1u+SZuz2M4XC+xw+9/hAegdOSDitaREegDz5+flAwkiM+z1XP/+lq73kt7BBCHEADOjSgy0EDuiQa0KEBXYcGdElUSAaokAxUSAb8p0KaY7lHahOgAV1AAzo0oIvQgA4N6IQzvANQFqm/MTe69AAAAABJRU5ErkJggg=="/>
</defs>
</svg>`
  }
];
</script>

<template>
  <div class="app-container relative">
    <!-- Section: Hero + Menu Box -->
    <section id="hero" class="relative pb-[250px]">
      <div class="h-[370px] w-full bg-primary"></div>

      <!-- Menu Box (centered) -->
      <div
        class="hidden md:block absolute z-10 left-1/2 -translate-x-1/2 top-80 w-[906px] h-[291px] rounded-[10px] bg-white shadow-sm border border-border"
      >
        <!-- Search Bar (centered) -->
        <div class="absolute top-[30px] left-1/2 -translate-x-1/2 w-[808px] h-[74px]">
          <div class="w-full h-full flex items-center gap-4 border border-border rounded-[10px] px-5">
            <input
              type="text"
              placeholder="Pencarian"
              class="w-full h-full outline-none text-[20px] font-medium placeholder:text-muted"
            />
            <button type="button" class="h-12 px-6 rounded-md bg-primary text-white text-[16px] font-semibold">
              Cari
            </button>
          </div>
        </div>

        <!-- Icon Menus Group (centered) -->
        <div class="absolute flex top-[139px] left-1/2 -translate-x-1/2 w-[582px] h-[97px] gap-[23px]">
          <RouterLink
            v-for="m in menuItems"
            :key="m.key"
            :to="m.to"
            class="group flex flex-col items-center justify-start gap-[21px] w-[98px] cursor-pointer"
          >
            <span
              v-html="m.svg"
              class="w-[98px] h-[66px] block transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5"
            ></span>
            <span class="text-product-desc-desktop w-full text-center transition-colors duration-200 motion-safe:group-hover:text-primary">
              {{ m.label }}
            </span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Section Promo -->
    <section id="promo" class="relative pt-24">
      <!-- Heading in-flow -->
      <div class="pl-[54px]">
        <div class="text-section-title inline-flex items-center gap-2.5 w-auto h-[35px] py-[5px]">
          <span class="text-section-title">Cek Promo Menarik</span>
        </div>
      </div>

      <div class="overflow-x-auto overflow-y-hidden no-scrollbar mx-[57px] pt-[17px] scroll-smooth snap-x snap-mandatory">
        <div class="flex gap-8 min-w-max">
          <div v-for="i in 5" :key="i" class="snap-start shrink-0">
            <PromoCard />
          </div>
        </div>
      </div>
    </section>

    <!-- Section Rekomendasi UMKM -->
    <section id="umkm-recommendation" class="relative pt-24">
      <div class="pl-[54px]">
        <div class="text-section-title inline-flex items-center gap-2.5 w-auto h-[35px] py-[5px]">
          <span class="text-section-title">Rekomendasi UMKM</span>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="px-[52px] mt-10 flex items-center gap-3">
        <span class="w-4 h-5 inline-flex items-center justify-center" aria-hidden="true">
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.88888 2.93493C6.71206 2.93493 6.5425 3.01894 6.41747 3.16847C6.29245 3.318 6.22221 3.52081 6.22221 3.73229C6.22221 3.94376 6.29245 4.14657 6.41747 4.2961C6.5425 4.44564 6.71206 4.52965 6.88888 4.52965C7.06569 4.52965 7.23526 4.44564 7.36028 4.2961C7.4853 4.14657 7.55554 3.94376 7.55554 3.73229C7.55554 3.52081 7.4853 3.318 7.36028 3.16847C7.23526 3.01894 7.06569 2.93493 6.88888 2.93493ZM5.00221 2.93493C5.13994 2.46805 5.39537 2.06376 5.73328 1.77779C6.07118 1.49182 6.47493 1.33826 6.88888 1.33826C7.30282 1.33826 7.70657 1.49182 8.04448 1.77779C8.38238 2.06376 8.63781 2.46805 8.77554 2.93493H13.5555C13.7324 2.93493 13.9019 3.01894 14.0269 3.16847C14.152 3.318 14.2222 3.52081 14.2222 3.73229C14.2222 3.94376 14.152 4.14657 14.0269 4.2961C13.9019 4.44564 13.7324 4.52965 13.5555 4.52965H8.77554C8.63781 4.99652 8.38238 5.40081 8.04448 5.68678C7.70657 5.97275 7.30282 6.12632 6.88888 6.12632C6.47493 6.12632 6.07118 5.97275 5.73328 5.68678C5.39537 5.40081 5.13994 4.99652 5.00221 4.52965H4.22221C4.0454 4.52965 3.87583 4.44564 3.7508 4.2961C3.62578 4.14657 3.55554 3.94376 3.55554 3.73229C3.55554 3.52081 3.62578 3.318 3.7508 3.16847C3.87583 3.01894 4.0454 2.93493 4.22221 2.93493H5.00221Z" fill="#757575"/></svg>
        </span>

        <div class="flex items-center gap-[7px]">
          <button
            type="button"
            @click="toggleFilter('kuliner')"
            :aria-pressed="activeFilter === 'kuliner'"
            class="w-[69px] h-[18px] flex items-center justify-center rounded-md text-[12px] leading-none transition-colors"
            :class="activeFilter === 'kuliner'
              ? 'bg-secondary text-white border border-transparent'
              : 'bg-white text-(--color-muted) border border-border'"
          >Kuliner</button>

          <button
            type="button"
            @click="toggleFilter('toko')"
            :aria-pressed="activeFilter === 'toko'"
            class="w-[69px] h-[18px] flex items-center justify-center rounded-md text-[12px] leading-none transition-colors"
            :class="activeFilter === 'toko'
              ? 'bg-secondary text-white border border-transparent'
              : 'bg-white text-(--color-muted) border border-border'"
          >Toko</button>

          <button
            type="button"
            @click="toggleFilter('jasa')"
            :aria-pressed="activeFilter === 'jasa'"
            class="w-[69px] h-[18px] flex items-center justify-center rounded-md text-[12px] leading-none transition-colors"
            :class="activeFilter === 'jasa'
              ? 'bg-secondary text-white border border-transparent'
              : 'bg-white text-(--color-muted) border border-border'"
          >Jasa</button>
        </div>
      </div>

      <!-- Grid 4 kolom (3 baris saja) -->
      <div class="px-[52px] mt-10">
        <div class="grid grid-cols-3 tablet:grid-cols-4 gap-x-[15px] tablet:gap-x-[60px] gap-y-2.5 tablet:gap-y-[30px]">
          <ProductCard
            v-for="product in displayedProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Tampilkan semua -->
        <div class="mt-6 flex justify-center">
          <span class="text-product-desc-desktop cursor-pointer hover:text-primary transition-colors">Tampilkan semua</span>
        </div>
      </div>
    </section>

    <!-- Section Event -->
    <section id="event" class="relative pt-24">
      <div class="pl-[54px]">
        <div class="text-section-title inline-flex items-center gap-2.5 w-auto h-[35px] py-[5px]">
          <span class="text-section-title">Event</span>
        </div>
      </div>

      <div class="overflow-x-auto overflow-y-hidden no-scrollbar mx-[57px] pt-[17px] scroll-smooth snap-x snap-mandatory">
        <div class="flex gap-8 min-w-max">
          <div v-for="i in 5" :key="i" class="snap-start shrink-0">
            <EventCard />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>