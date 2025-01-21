import { useTranslation } from "react-i18next";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Tooltip,
  chakra,
  TableContainer,
} from "@chakra-ui/react";
import { MerkleDistributorInfo } from "@/app/types/airdrop";
import { formatAmount, getEllipsizedAddress } from "@/app/utils/clientHelper";

export default function PreviewList({
  data,
  decimals = 18,
  preceision = 2,
}: {
  data: MerkleDistributorInfo;
  decimals?: number;
  preceision?: number;
}) {
  const { t } = useTranslation();
  return (
    <TableContainer>
      <Text fontSize={"sm"} fontWeight={"bold"}>
        {t("airdrop.merkleTreePreview.totalAmount")}:{" "}
        {formatAmount(data.airdropAmount, decimals, preceision)}
      </Text>
      <Text fontSize={"sm"} fontWeight={"bold"}>
        {t("airdrop.merkleTreePreview.eligibleUsersNum")}: {Object.entries(data.claims).length}
      </Text>
      <Table variant="simple" mt={4}>
        <Thead>
          <Tr>
            <Th>{t("airdrop.merkleTreePreview.address")}</Th>
            <Th isNumeric>{t("airdrop.merkleTreePreview.amount")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(data.claims)
            .sort((a, b) => Number(BigInt(b[1].amount) - BigInt(a[1].amount)))
            .map(([address, claim], idx) => (
              <Tr key={idx}>
                <Td>
                  {/* <Tooltip label={address}>
                  {getEllipsizedAddress({ address: address as `0x${string}` })}
                </Tooltip> */}
                  <chakra.span fontSize={"xs"}>{address}</chakra.span>
                </Td>
                <Td isNumeric>
                  <chakra.span fontSize={"sm"}>
                    {formatAmount(claim.amount, decimals, preceision)}
                  </chakra.span>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
