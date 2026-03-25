import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useUsers } from '../../src/hooks/queries/useUsers';
import { useZones } from '../../src/hooks/queries/useZones';
import { StatusIndicator } from '../../src/components/ui/StatusIndicator';
import { Badge } from '../../src/components/ui/Badge';
import { Modal } from '../../src/components/ui/Modal';
import { Card } from '../../src/components/ui/Card';
import { colors } from '../../src/utils/colors';

type GroupBy = 'none' | 'zone' | 'status';

export default function UsersScreen() {
  const [search, setSearch] = useState('');
  const [filterZone, setFilterZone] = useState<string>('');
  const [filterAffiliation, setFilterAffiliation] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filters: Record<string, string> = {};
  if (search) filters.search = search;
  if (filterZone) filters.zoneId = filterZone;
  if (filterAffiliation) filters.affiliation = filterAffiliation;
  if (filterStatus) filters.status = filterStatus;

  const { data: users, refetch, isRefetching } = useUsers(
    Object.keys(filters).length > 0 ? filters : undefined
  );
  const { data: zones } = useZones();

  const groupedData = useMemo(() => {
    if (!users) return [];
    if (groupBy === 'none') return users;

    const groups: Record<string, any[]> = {};
    users.forEach((user: any) => {
      const key =
        groupBy === 'zone'
          ? user.zoneId || 'Unassigned'
          : user.responseStatus || 'no_reply';
      if (!groups[key]) groups[key] = [];
      groups[key].push(user);
    });

    return Object.entries(groups).map(([key, items]) => ({
      groupKey: key,
      groupLabel:
        groupBy === 'zone'
          ? zones?.find((z: any) => z.id === key)?.name || key
          : key.replace('_', ' ').toUpperCase(),
      items,
    }));
  }, [users, groupBy, zones]);

  const renderUser = (user: any) => (
    <TouchableOpacity
      key={user.id}
      onPress={() => setSelectedUser(user)}
      style={styles.userRow}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userBadge}>{user.badgeNumber}</Text>
      </View>
      <View style={styles.userMeta}>
        <Badge
          text={user.affiliation}
          variant={user.affiliation === 'aramco' ? 'info' : 'default'}
        />
        <StatusIndicator status={user.responseStatus} size="small" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or badge..."
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, !filterAffiliation && styles.filterBtnActive]}
          onPress={() => setFilterAffiliation('')}
        >
          <Text style={[styles.filterText, !filterAffiliation && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            filterAffiliation === 'aramco' && styles.filterBtnActive,
          ]}
          onPress={() =>
            setFilterAffiliation(filterAffiliation === 'aramco' ? '' : 'aramco')
          }
        >
          <Text
            style={[
              styles.filterText,
              filterAffiliation === 'aramco' && styles.filterTextActive,
            ]}
          >
            Aramco
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            filterAffiliation === 'contractor' && styles.filterBtnActive,
          ]}
          onPress={() =>
            setFilterAffiliation(
              filterAffiliation === 'contractor' ? '' : 'contractor'
            )
          }
        >
          <Text
            style={[
              styles.filterText,
              filterAffiliation === 'contractor' && styles.filterTextActive,
            ]}
          >
            Contractor
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <View style={styles.filterRow}>
        {['', 'safe', 'pending', 'need_help', 'no_reply'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.filterBtn,
              filterStatus === s && styles.filterBtnActive,
              s && { borderColor: colors.status[s as keyof typeof colors.status] },
            ]}
            onPress={() => setFilterStatus(s)}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === s && styles.filterTextActive,
              ]}
            >
              {s ? s.replace('_', ' ') : 'All Status'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Group By */}
      <View style={styles.filterRow}>
        <Text style={styles.groupLabel}>Group:</Text>
        {(['none', 'zone', 'status'] as GroupBy[]).map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.filterBtn, groupBy === g && styles.filterBtnActive]}
            onPress={() => setGroupBy(g)}
          >
            <Text style={[styles.filterText, groupBy === g && styles.filterTextActive]}>
              {g === 'none' ? 'None' : g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={groupBy === 'none' ? users || [] : groupedData}
        keyExtractor={(item: any) => item.id || item.groupKey}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        renderItem={({ item }) => {
          if (groupBy !== 'none') {
            return (
              <View style={styles.group}>
                <Text style={styles.groupTitle}>
                  {item.groupLabel} ({item.items.length})
                </Text>
                {item.items.map(renderUser)}
              </View>
            );
          }
          return renderUser(item);
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No personnel found</Text>
        }
      />

      {/* Detail Modal */}
      {selectedUser && (
        <Modal
          visible={true}
          onClose={() => setSelectedUser(null)}
          title="Personnel Detail"
        >
          <Card>
            <Text style={styles.detailName}>{selectedUser.name}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Badge:</Text>
              <Text style={styles.detailValue}>{selectedUser.badgeNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role:</Text>
              <Badge text={selectedUser.role} variant="info" />
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Affiliation:</Text>
              <Badge
                text={selectedUser.affiliation}
                variant={selectedUser.affiliation === 'aramco' ? 'info' : 'default'}
              />
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Company:</Text>
              <Text style={styles.detailValue}>
                {selectedUser.company || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <StatusIndicator status={selectedUser.responseStatus} />
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Zone:</Text>
              <Text style={styles.detailValue}>
                {zones?.find((z: any) => z.id === selectedUser.zoneId)?.name ||
                  'Unassigned'}
              </Text>
            </View>
            {selectedUser.ecoSlot && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ECO Slot:</Text>
                <Text style={styles.detailValue}>{selectedUser.ecoSlot}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Online:</Text>
              <Text style={styles.detailValue}>
                {selectedUser.isOnline ? 'Yes' : 'No'}
              </Text>
            </View>
            {selectedUser.currentLatitude && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GPS:</Text>
                <Text style={styles.detailValue}>
                  {selectedUser.currentLatitude.toFixed(6)},{' '}
                  {selectedUser.currentLongitude.toFixed(6)}
                </Text>
              </View>
            )}
          </Card>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  searchContainer: {
    padding: 12,
    paddingBottom: 0,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: colors.white,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[500],
  },
  list: {
    padding: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  userBadge: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  group: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray[500],
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray[400],
    fontSize: 16,
    paddingTop: 40,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: '500',
  },
});
